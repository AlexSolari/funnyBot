import escapeMarkdown from '../../helpers/escapeMarkdown';
import {
    IMWApiResponse,
    IMwApiResponseDateSlot
} from '../../types/externalApiDefinitions/mw';
import { ChatId } from '../../types/chatIds';
import { secondsToMilliseconds } from 'chz-telegram-bot';
import moment from 'moment';
import { CommandBuilder } from '../../helpers/commandBuilder';
import spellseekerEvent from '../../content/spellseeker.json';

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
};

export const registration = new CommandBuilder('Reaction.Registration')
    .on(['рега', 'Рега', 'рєга', 'Рєга', 'РЕГА', 'РЄГА'])
    .do(async (ctx) => {
        let serviceName = '';

        switch (ctx.chatInfo.id) {
            case ChatId.PioneerChat:
                serviceName = 'Піонер';
                break;
            case ChatId.ModernChat:
                serviceName = 'Модерн';
                break;
            case ChatId.StandardChat:
                serviceName = 'Стандарт';
                break;
            case ChatId.PauperChat:
                serviceName = 'Pauper';
                break;
            default:
                ctx.skipCooldown();
                return;
        }

        const today = moment().startOf('day').format('YYYY-MM-DD');
        const month = moment()
            .add(1, 'months')
            .startOf('day')
            .format('YYYY-MM-DD');

        const response = await fetch(
            `https://api.wlaunch.net/v1/company/7ea091e0-359a-11eb-86df-9f45a44f29bd/branch/7ea10724-359a-11eb-86df-9f45a44f29bd/slot/gt/resource?start=${today}&end=${month}&source=WIDGET&withDiscounts=true&preventBookingEnabled=true`
        );
        const data = (await response.json()) as IMWApiResponse;
        const slots = data.slots
            .map((x) =>
                x.date_slots.map(
                    (ds) =>
                        ({
                            date: moment.utc(ds.date),
                            slots: ds.slots
                        } as IMwApiResponseDateSlot)
                )
            )
            .flat(Infinity) as IMwApiResponseDateSlot[];

        const resources = slots
            .filter((x) => x.slots.length > 0)
            .sort((a, b) => a.date.valueOf() - b.date.valueOf())
            .map(({ date, slots }) =>
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
            .flat()
            .filter((x) => x.gt.service.name.includes(serviceName));

        if (!resources || resources.length == 0) {
            ctx.reply.withText(`поки нема`);
            return;
        }

        const eventInfos = resources.map<EventInfo>((x) => ({
            date: x.date,
            name: x.gt.name ?? x.gt.service?.name ?? serviceName,
            id: x.id,
            spaces: x.gt.space,
            usedSpaces: x.gt.used_space
        }));

        let text = eventInfos.length > 0 ? 'Реєстрації:\n\n' : '';

        if (serviceName == 'Піонер')
            text += `[${escapeMarkdown(spellseekerEvent.name)}](${
                spellseekerEvent.link
            }) відбудеться у ${escapeMarkdown(spellseekerEvent.date)}\n`;

        eventInfos.forEach((x, i) => {
            text += `[${escapeMarkdown(
                x.name
            )}](https://w.wlaunch.net/c/magic_world/events/b/7ea10724-359a-11eb-86df-9f45a44f29bd/e/${
                x.id
            }) \\(${x.usedSpaces} уже в резі\\) відбудеться у ${escapeMarkdown(
                x.date
            )}`;

            if (i + 1 < eventInfos.length) text += '\n';
        });

        ctx.reply.withText(text);
    })
    .build();
