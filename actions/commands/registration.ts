import escapeMarkdown from '../../helpers/escapeMarkdown';
import {
    IMWApiResponse,
    IMwApiResponseDateSlot,
    IMWEventDetail
} from '../../types/externalApiDefinitions/mw';
import { ChatId } from '../../types/chatIds';
import { ChatInfo, secondsToMilliseconds } from 'chz-telegram-bot';
import moment, { Moment } from 'moment';
import { CommandBuilder } from '../../helpers/commandBuilder';
import { Format } from '../../types/mtgFormats';
import { traceFetch } from '../../helpers/fetchWithObservability';
import { getObservability } from '../../helpers/getObservability';
import { ObservabilityHelper } from '../../types/observabilityHelper';
import { SpellseekerEventDto } from '../../types/externalApiDefinitions/event';
import Papa from 'papaparse';
import { gid, sheetId } from '../../spellseekerDataIds.json';

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
    date: Moment;
    dateString: string | null;
    name: string;
    id: number;
    spaces: number;
    usedSpaces: number;
    link: string;
};

const weekdayNameRegex =
    /неділя|понеділок|вівторок|середа|четвер|п’ятниця|субота/;

const spellseekerDateFormatter = new Intl.DateTimeFormat('uk-UA', {
    timeZone: 'Europe/Kyiv',
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
            const usedSpacesText =
                event.usedSpaces == -1
                    ? ''
                    : ` \\(${event.usedSpaces} уже в резі\\)`;

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
        console.error(magicWorldResult.reason);
        showRetryLaterMessage = true;
    }

    if (spellseekerResult.status === 'fulfilled') {
        eventInfos.push(...spellseekerResult.value);
    } else {
        console.error(spellseekerResult.reason);
        showRetryLaterMessage = true;
    }

    eventInfos.sort((a, b) => a.date.valueOf() - b.date.valueOf());

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

    const today = moment().startOf('day').format('YYYY-MM-DD');
    const month = moment().add(1, 'months').startOf('day').format('YYYY-MM-DD');

    const response = await traceFetch(
        `https://api.wlaunch.net/v1/company/7ea091e0-359a-11eb-86df-9f45a44f29bd/branch/7ea10724-359a-11eb-86df-9f45a44f29bd/slot/gt/resource?start=${today}&end=${month}&source=WIDGET&withDiscounts=true&preventBookingEnabled=true`,
        observability
    );
    const data = (await response.json()) as IMWApiResponse;
    const slots = data.slots.flatMap((x) =>
        x.date_slots.map<IMwApiResponseDateSlot>((ds) => ({
            date: moment.utc(ds.date),
            slots: ds.slots
        }))
    );

    return slots
        .filter((x) => x.slots.length > 0)
        .sort((a, b) => a.date.valueOf() - b.date.valueOf())
        .flatMap(({ date, slots }) =>
            slots.map((x) => {
                const result = x as IMWEventDetail & { dateObject: Moment };

                result.dateObject = moment.utc(
                    date.valueOf() + secondsToMilliseconds(x.time.start_time)
                );
                result.date = result.dateObject
                    .locale('uk')
                    .format('dddd, DD MMMM, HH:mm')
                    .replace(weekdayNameRegex, (day) => daysMap[day]);
                return result;
            })
        )
        .filter((x) => x.gt.service?.name?.includes(serviceName))
        .map<EventInfo>((x) => ({
            date: x.dateObject,
            dateString: x.date,
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
): Promise<EventInfo[]> {
    if (formatName != Format.Pioneer && formatName != Format.Pauper) {
        return [];
    }

    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
    const response = await traceFetch(url, observability);
    const csv = await response.text();

    const { data, errors } = Papa.parse<SpellseekerEventDto>(csv, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        transformHeader: (header) => spellseekerHeaderMap[header] ?? header
    });

    if (errors.length > 0) {
        observability.emitter.emit('error.generic', {
            traceId: observability.traceId,
            error: new Error(
                `Failed to parse CSV from Google Sheets: ${errors.map((e) => e.message).join('; ')}`
            )
        });
    }

    return data
        .filter(
            (x) =>
                x.registration == 'open' &&
                x.tags.toLowerCase().split(/\s+/).includes(`#${formatName}`)
        )
        .map<EventInfo>((x) => {
            const date = moment.utc(x.startDatetime);
            const dateParts = Object.fromEntries(
                spellseekerDateFormatter
                    .formatToParts(date.toDate())
                    .map(({ type, value }) => [type, value])
            );
            const weekday = dateParts.weekday.replace(/[\u2019\u02bc']/g, '’');

            return {
                date: date,
                dateString: `${daysMap[weekday] ?? weekday}, ${dateParts.day} ${dateParts.month}, ${dateParts.hour}:${dateParts.minute}`,
                name: '[SpellSeeker] ' + x.title,
                id: x.id,
                spaces: 0,
                usedSpaces: -1,
                link: x.link.replace('c/3151970401', 'skyhobbyshop/2')
            };
        });
}
