import escapeMarkdown from '../../helpers/escapeMarkdown';
import {
    IMWApiResponse,
    IMwApiResponseDateSlot
} from '../../types/externalApiDefinitions/mw';
import { ChatId } from '../../types/chatIds';
import { ChatInfo, secondsToMilliseconds } from 'chz-telegram-bot';
import moment from 'moment';
import { CommandBuilder } from '../../helpers/commandBuilder';
import { load } from 'cheerio';

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
    date: string;
    name: string;
    id: number;
    spaces: number;
    usedSpaces: number;
    link: string;
};

export const registration = new CommandBuilder('Reaction.Registration')
    .on(['рега', 'Рега', 'рєга', 'Рєга', 'РЕГА', 'РЄГА'])
    .do(async (ctx) => {
        const serviceName = determineServiceName(ctx.chatInfo);
        if (!serviceName) {
            ctx.skipCooldown();
            return;
        }

        const eventInfos = await fetchEventsFromMagicWorld(serviceName);

        let text = eventInfos.length > 0 ? 'Реєстрації:\n\n' : '';

        if (serviceName == 'Піонер') {
            eventInfos.push(...(await fetchPioneerEventsFromSpellseeker()));
        } else if (serviceName == 'Pauper') {
            eventInfos.push(...(await fetchPauperEventsFromSpellseeker()));
        }

        if (eventInfos.length == 0) {
            ctx.reply.withText(`поки нема`);
            return;
        }

        for (const event of eventInfos) {
            const usedSpacesText =
                event.usedSpaces == -1
                    ? ''
                    : ` \\(${event.usedSpaces} уже в резі\\)`;

            text += `[${escapeMarkdown(event.name)}](${
                event.link
            })${usedSpacesText} відбудеться у ${escapeMarkdown(event.date)}\n`;
        }
        ctx.reply.withText(text.trim());
    })
    .build();

function determineServiceName(chatInfo: ChatInfo) {
    switch (chatInfo.id) {
        case ChatId.PioneerChat:
            return 'Піонер';
        case ChatId.ModernChat:
            return 'Модерн';
        case ChatId.StandardChat:
            return 'Стандарт';
        case ChatId.PauperChat:
            return 'Pauper';
        default:
            return null;
    }
}

async function fetchEventsFromMagicWorld(serviceName: string) {
    const today = moment().startOf('day').format('YYYY-MM-DD');
    const month = moment().add(1, 'months').startOf('day').format('YYYY-MM-DD');

    const response = await fetch(
        `https://api.wlaunch.net/v1/company/7ea091e0-359a-11eb-86df-9f45a44f29bd/branch/7ea10724-359a-11eb-86df-9f45a44f29bd/slot/gt/resource?start=${today}&end=${month}&source=WIDGET&withDiscounts=true&preventBookingEnabled=true`
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
                    .replace(
                        /неділя|понеділок|вівторок|середа|четвер|п’ятниця|субота/,
                        (day) => daysMap[day]
                    );
                return x;
            })
        )
        .filter((x) => x.gt.service?.name?.includes(serviceName))
        .map<EventInfo>((x) => ({
            date: x.date,
            name: x.gt.name ?? x.gt.service?.name ?? serviceName,
            id: x.id,
            spaces: x.gt.space,
            usedSpaces: x.gt.used_space,
            link: `https://w.wlaunch.net/c/magic_world/events/b/7ea10724-359a-11eb-86df-9f45a44f29bd/e/${x.id}`
        }));
}

async function fetchPioneerEventsFromSpellseeker(): Promise<EventInfo[]> {
    let response = await fetch('https://t.me/s/spellseeker_pioneer_announces');
    let html = await response.text();
    let findInDOM = load(html);

    const lastLink = load(
        findInDOM(
            '.tgme_widget_message_wrap:last-of-type .tgme_widget_message_text'
        )[0]
    ).text();

    if (!lastLink.includes('http:')) {
        return [];
    }

    response = await fetch(`${lastLink}?embed=1&mode=tme`, {
        headers: {
            referrer: lastLink
        }
    });
    html = await response.text();
    findInDOM = load(html);

    const [date, day, name, time] = findInDOM(
        '.tgme_widget_message_poll_question'
    )
        .text()
        .split(',');

    const today = Number.parseInt(moment().startOf('day').format('DD'));
    const eventDay = Number.parseInt(date.split(' ')[0]);

    if (today > eventDay && Math.abs(today - eventDay) <= 7) {
        return [];
    }

    return [
        {
            date: `${day
                .trim()
                .replace(
                    /неділя|понеділок|вівторок|середа|четвер|п’ятниця|субота/,
                    (day) => daysMap[day]
                )}, ${date.trim()}, ${time.trim()}`,
            name: `${name.trim()}`,
            id: Math.random(),
            spaces: 0,
            usedSpaces: -1,
            link: lastLink
        }
    ];
}

async function fetchPauperEventsFromSpellseeker(): Promise<EventInfo[]> {
    const response = await fetch('https://t.me/s/spellseeker_pauper_announces');
    const html = await response.text();
    const findInDOM = load(html);

    const lastLink = load(
        findInDOM(
            '.tgme_widget_message_wrap:last-of-type .tgme_widget_message_text'
        )[0]
    ).text();

    if (!lastLink.includes('http:')) {
        return [];
    }

    return [
        {
            date: `неділю`,
            name: `Паупер у Спелсікері`,
            id: Math.random(),
            spaces: 0,
            usedSpaces: -1,
            link: lastLink
        }
    ];
}
