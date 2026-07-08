import escapeMarkdown from '../../helpers/escapeMarkdown';
import {
    IMWApiResponse,
    IMwApiResponseDateSlot
} from '../../types/externalApiDefinitions/mw';
import { ChatId } from '../../types/chatIds';
import { ChatInfo, secondsToMilliseconds } from 'chz-telegram-bot';
import moment from 'moment';
import { CommandBuilder } from '../../helpers/commandBuilder';
import { Format } from '../../types/mtgFormats';
import { traceFetch } from '../../helpers/fetchWithObservability';
import { getObservability } from '../../helpers/getObservability';
import { ObservabilityHelper } from '../../types/observabilityHelper';
import { EventDto } from '../../types/externalApiDefinitions/event';
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
    date: string | null;
    name: string;
    id: number;
    spaces: number;
    usedSpaces: number;
    link: string;
};

const weekdayNameRegex =
    /неділя|понеділок|вівторок|середа|четвер|п’ятниця|субота/;

export const registration = new CommandBuilder('Reaction.Registration')
    .on(['рега', 'Рега', 'рєга', 'Рєга', 'РЕГА', 'РЄГА'])
    .do(async (ctx) => {
        const [serviceName, format] = determineServiceName(ctx.chatInfo);
        if (!serviceName) {
            ctx.skipCooldown();
            return;
        }

        const observability = getObservability(ctx);
        const { eventInfos, showRetryLaterMessage } = await loadEvents(
            serviceName,
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

            text += event.date
                ? `[${escapeMarkdown(event.name)}](${event.link})${usedSpacesText} відбудеться у ${escapeMarkdown(event.date)}\n`
                : `[${escapeMarkdown(event.name)}](${event.link})${usedSpacesText}\n`;
        }

        if (showRetryLaterMessage) {
            text +=
                '\n\nДеякі реєстрації не вдалося завантажити, спробуйте пізніше або пінганіть Чіза\\.';
        }

        ctx.reply.withText(text.trim());
    })
    .build();

async function loadEvents(
    serviceName: string,
    format: Format,
    observability: ObservabilityHelper
) {
    const [magicWorldResult, spellseekerResult] = await Promise.allSettled([
        fetchEventsFromMagicWorld(serviceName, observability),
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

    return { eventInfos, showRetryLaterMessage };
}

function determineServiceName(
    chatInfo: ChatInfo
): [string, Format] | [null, null] {
    switch (chatInfo.id) {
        case ChatId.TestChat:
        case ChatId.PioneerChat:
            return ['Піонер', Format.Pioneer];
        case ChatId.ModernChat:
            return ['Модерн', Format.Modern];
        case ChatId.StandardChat:
            return ['Стандарт', Format.Standard];
        case ChatId.PauperChat:
            return ['Pauper', Format.Pauper];
        default:
            return [null, null];
    }
}

async function fetchEventsFromMagicWorld(
    serviceName: string,
    observability: ObservabilityHelper
) {
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
                x.date = moment
                    .utc(
                        date.valueOf() +
                            secondsToMilliseconds(x.time.start_time)
                    )
                    .locale('uk')
                    .format('dddd, DD MMMM, HH:mm')
                    .replace(weekdayNameRegex, (day) => daysMap[day]);
                return x;
            })
        )
        .filter((x) => x.gt.service?.name?.includes(serviceName))
        .map<EventInfo>((x) => ({
            date: x.date,
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

    const { data, errors } = Papa.parse<EventDto>(csv, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true
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
                x.category == 'mtg' &&
                x.status == 'open' &&
                x.title.toLowerCase().includes(formatName)
        )
        .map<EventInfo>((x) => ({
            date: moment(x.start_datetime)
                .locale('uk')
                .format('dddd, DD MMMM, HH:mm')
                .replace(weekdayNameRegex, (day) => daysMap[day]),
            name: '[SpellSeeker] ' + x.title,
            id: Number.parseInt(
                x.event_id.replaceAll('-', '').replaceAll('EVT', '')
            ),
            spaces: 0,
            usedSpaces: -1,
            link: x.message_link.replace('c/3151970401', 'skyhobbyshop/2')
        }));
}
