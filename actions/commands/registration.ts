import escapeMarkdown from '../../helpers/escapeMarkdown';
import {
    IMWApiResponse,
    IMwApiResponseDateSlot,
    IMWEventDetail
} from '../../types/externalApiDefinitions/mw';
import { ChatId } from '../../secrets/chatIds';
import { ChatInfo } from 'chz-telegram-bot';
import { CommandBuilder } from '../../helpers/commandBuilder';
import { Format } from '../../types/mtgFormats';
import { traceFetch } from '../../helpers/fetchWithObservability';
import { getObservability } from '../../helpers/getObservability';
import { emitError } from '../../helpers/emitError';
import { ObservabilityHelper } from '../../types/observabilityHelper';
import { SpellseekerEventDto } from '../../types/externalApiDefinitions/event';
import Papa from 'papaparse';
import { gid, sheetId } from '../../secrets/spellseekerDataIds.json';
import { traceTelegramUserCall } from '../../services/telegramUserClient';

const daysMap = {
    неділя: 'неділю',
    понеділок: 'понеділок',
    вівторок: 'вівторок',
    середа: 'середу',
    четвер: 'четвер',
    'п’ятниця': 'п’ятницю',
    субота: 'суботу'
} as Record<string, string>;

type EventInfo = {
    date: Temporal.ZonedDateTime;
    dateString: string | null;
    name: string;
    id: number;
    spaces: number;
    usedSpaces: number;
    potentialSpaces?: number;
    link: string;
};

const eventTimeZone = 'Europe/Kyiv';

const eventDateFormatter = new Intl.DateTimeFormat('uk-UA', {
    timeZone: eventTimeZone,
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
});

const spellseekerHeaderMap: Record<string, string> = {
    ID: 'id',
    Назва: 'title',
    Початок: 'startDatetime',
    Реєстрація: 'registration',
    Теги: 'tags',
    Посилання: 'link'
};

export const registration = new CommandBuilder('Reaction.Registration')
    .on(['рега', 'Рега', 'рєга', 'Рєга', 'РЕГА', 'РЄГА'])
    .do(async (ctx) => {
        const format = determineFormat(ctx.chatInfo);
        if (!format) {
            ctx.skipCooldown();
            return;
        }

        const observability = getObservability(ctx);
        const { eventInfos, showRetryLaterMessage } = await loadEvents(
            format,
            observability
        );

        if (eventInfos.length == 0 && !showRetryLaterMessage) {
            ctx.reply.withText(`поки нема`);
            return;
        }

        let text = eventInfos.length > 0 ? 'Реєстрації:\n\n' : '';

        for (const event of eventInfos) {
            const usedSpacesText = buildUsedSpacesText(event);

            text += event.dateString
                ? `[${escapeMarkdown(event.name)}](${event.link})${usedSpacesText} відбудеться у ${escapeMarkdown(event.dateString)}\n`
                : `[${escapeMarkdown(event.name)}](${event.link})${usedSpacesText}\n`;
        }

        if (showRetryLaterMessage) {
            text +=
                '\n\nДеякі реєстрації не вдалося завантажити, спробуйте пізніше або пінганіть Чіза\\.';
        }

        ctx.reply.withText(text.trim());
    })
    .build();

/** Formats as e.g. `пʼятницю, 21 листопада, 18:00` (accusative weekday). */
function formatEventDate(date: Temporal.ZonedDateTime): string {
    const dateParts = Object.fromEntries(
        eventDateFormatter
            .formatToParts(date.toInstant())
            .map(({ type, value }) => [type, value])
    );
    const weekday = dateParts.weekday.replace(/[’ʼ']/g, '’');

    return `${daysMap[weekday] ?? weekday}, ${dateParts.day} ${dateParts.month}, ${dateParts.hour}:${dateParts.minute}`;
}

/**
 * Sheet values are expected to carry an offset; values without one are read
 * as UTC wall-clock time. Returns null for unparseable values.
 */
function parseSpellseekerDate(value: string): Temporal.ZonedDateTime | null {
    try {
        return Temporal.Instant.from(value).toZonedDateTimeISO(eventTimeZone);
    } catch {
        // No offset in the value, fall through.
    }

    try {
        return Temporal.PlainDateTime.from(value)
            .toZonedDateTime('UTC')
            .withTimeZone(eventTimeZone);
    } catch {
        return null;
    }
}

function buildUsedSpacesText(event: EventInfo): string {
    if (event.usedSpaces == -1) return '';

    if (!event.potentialSpaces) return ` \\(${event.usedSpaces} уже в резі\\)`;

    return ` \\(${event.usedSpaces} уже в резі, ${event.potentialSpaces} думають\\)`;
}

async function loadEvents(format: Format, observability: ObservabilityHelper) {
    const [magicWorldResult, spellseekerResult] = await Promise.allSettled([
        fetchEventsFromMagicWorld(format, observability),
        loadSpellseekerEvents(format, observability)
    ]);

    const eventInfos: EventInfo[] = [];
    let showRetryLaterMessage = false;

    if (magicWorldResult.status === 'fulfilled') {
        eventInfos.push(...magicWorldResult.value);
    } else {
        emitError(
            observability,
            'Failed to load Magic World events',
            magicWorldResult.reason
        );
        showRetryLaterMessage = true;
    }

    if (spellseekerResult.status === 'fulfilled') {
        // Each event loads on its own, so one failed poll lookup drops only that event.
        for (const eventResult of await Promise.allSettled(
            spellseekerResult.value
        )) {
            if (eventResult.status === 'fulfilled') {
                eventInfos.push(eventResult.value);
            } else {
                emitError(
                    observability,
                    'Failed to load a Spellseeker event',
                    eventResult.reason
                );
                showRetryLaterMessage = true;
            }
        }
    } else {
        emitError(
            observability,
            'Failed to load Spellseeker events',
            spellseekerResult.reason
        );
        showRetryLaterMessage = true;
    }

    eventInfos.sort((a, b) => Temporal.ZonedDateTime.compare(a.date, b.date));

    return { eventInfos, showRetryLaterMessage };
}

function determineMWServiceName(format: Format) {
    switch (format) {
        case Format.Pioneer:
            return 'Піонер';
        case Format.Modern:
            return 'Модерн';
        case Format.Standard:
            return 'Стандарт';
        case Format.Pauper:
            return 'Pauper';
        default:
            return null;
    }
}

function determineFormat(chatInfo: ChatInfo): Format | null {
    switch (chatInfo.id) {
        case ChatId.TestChat:
        case ChatId.PioneerChat:
            return Format.Pioneer;
        case ChatId.ModernChat:
            return Format.Modern;
        case ChatId.StandardChat:
            return Format.Standard;
        case ChatId.PauperChat:
            return Format.Pauper;
        default:
            return null;
    }
}

async function fetchEventsFromMagicWorld(
    format: Format,
    observability: ObservabilityHelper
) {
    const serviceName = determineMWServiceName(format);
    if (!serviceName) {
        return [];
    }

    const today = Temporal.Now.plainDateISO();
    const start = today.toString();
    const end = today.add({ months: 1 }).toString();

    const response = await traceFetch(
        `https://api.wlaunch.net/v1/company/7ea091e0-359a-11eb-86df-9f45a44f29bd/branch/7ea10724-359a-11eb-86df-9f45a44f29bd/slot/gt/resource?start=${start}&end=${end}&source=WIDGET&withDiscounts=true&preventBookingEnabled=true`,
        observability
    );
    const data = (await response.json()) as IMWApiResponse;

    return data.slots
        .flatMap((x) => x.date_slots)
        .flatMap(({ date, slots }: IMwApiResponseDateSlot) =>
            slots.map((x: IMWEventDetail) => ({
                ...x,
                // MW reports local wall-clock time: a date plus seconds since midnight.
                dateObject: Temporal.PlainDate.from(date)
                    .toPlainDateTime()
                    .add({ seconds: x.time.start_time })
                    .toZonedDateTime(eventTimeZone)
            }))
        )
        .filter((x) => x.gt.service?.name?.includes(serviceName))
        .map<EventInfo>((x) => ({
            date: x.dateObject,
            dateString: formatEventDate(x.dateObject),
            name:
                '[Magic World] ' +
                (x.gt.name ?? x.gt.service?.name ?? serviceName),
            id: x.id,
            spaces: x.gt.space,
            usedSpaces: x.gt.used_space,
            link: `https://w.wlaunch.net/c/magic_world/events/b/7ea10724-359a-11eb-86df-9f45a44f29bd/e/${x.id}`
        }));
}

async function loadSpellseekerEvents(
    formatName: Format,
    observability: ObservabilityHelper
): Promise<Promise<EventInfo>[]> {
    if (formatName != Format.Pioneer && formatName != Format.Pauper) {
        return [];
    }

    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
    const response = await traceFetch(url, observability);
    const csv = await response.text();

    const { data, errors } = Papa.parse<SpellseekerEventDto>(csv, {
        header: true,
        skipEmptyLines: true,
        // Papa turns ISO date strings into `Date`s; keep them as strings for Temporal.
        dynamicTyping: (field) => field !== 'startDatetime',
        transformHeader: (header) => spellseekerHeaderMap[header] ?? header
    });

    if (errors.length > 0) {
        emitError(
            observability,
            `Failed to parse CSV from Google Sheets: ${errors.map((e) => e.message).join('; ')}`
        );
    }

    const now = Temporal.Now.instant();

    return data
        .filter(
            (x) =>
                x.registration == 'open' &&
                x.startDatetime &&
                x.tags?.toLowerCase().split(/\s+/).includes(`#${formatName}`)
        )
        .map((x) => ({
            ...x,
            date: parseSpellseekerDate(x.startDatetime)
        }))
        .filter(
            (x): x is typeof x & { date: Temporal.ZonedDateTime } =>
                x.date != null &&
                Temporal.Instant.compare(x.date.toInstant(), now) > 0
        )
        .map<Promise<EventInfo>>(async (x) => {
            const poll = await traceTelegramUserCall(
                'getPollResults',
                observability,
                (client) =>
                    client.getPollResults({
                        chatId: -1003151970401,
                        message: parseInt(x.link.split('/').pop() ?? '0')
                    })
            );

            return {
                date: x.date,
                dateString: formatEventDate(x.date),
                name: '[SpellSeeker] ' + x.title,
                id: x.id,
                spaces: 0,
                usedSpaces: poll.answers.filter((a) => a.text == 'Буду')[0]
                    .voters,
                potentialSpaces: poll.answers.filter(
                    (a) => a.text == 'Думаю'
                )[0].voters,
                link: x.link.replace('c/3151970401', 'skyhobbyshop/2')
            };
        });
}
