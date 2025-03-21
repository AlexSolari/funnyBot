import getCurrentWeek from '../../helpers/getWeek';
import escapeMarkdown from '../../helpers/escapeMarkdown';
import {
    IMWApiResponse,
    IMwApiResponseDateSlot
} from '../../types/externalApiDefinitions/mw';
import { ChatId } from '../../types/chatIds';
import { CommandActionBuilder, Seconds } from 'chz-telegram-bot';
import { secondsToMilliseconds } from 'chz-telegram-bot/dist/helpers/timeConvertions';

export default new CommandActionBuilder('Reaction.Registration')
    .on(['рега', 'Рега', 'рєга', 'Рєга', 'РЕГА', 'РЄГА'])
    .do(async (ctx) => {
        let serviceName = '';

        switch (ctx.chatId) {
            case ChatId.PioneerChat:
                serviceName = 'Піонер';
                break;
            case ChatId.ModernChat:
                serviceName = 'Модерн';
                break;
            case ChatId.StandardChat:
                serviceName = 'Стандарт';
                break;
            default:
                ctx.startCooldown = false;
                return;
        }

        const currentWeek = getCurrentWeek();
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric'
        } as Intl.DateTimeFormatOptions;

        const response = await fetch(
            `https://api.wlaunch.net/v1/company/7ea091e0-359a-11eb-86df-9f45a44f29bd/branch/7ea10724-359a-11eb-86df-9f45a44f29bd/slot/gt/resource?start=${currentWeek.firstDay}&end=${currentWeek.lastDay}&source=WIDGET&withDiscounts=true&preventBookingEnabled=true`
        );
        const data = (await response.json()) as IMWApiResponse;
        const slots = data.slots
            .map((x) =>
                x.date_slots.map(
                    (ds) =>
                        ({
                            date: new Date(ds.date + 'T00:00:00'),
                            slots: ds.slots
                        } as IMwApiResponseDateSlot)
                )
            )
            .flat(Infinity) as IMwApiResponseDateSlot[];
        const resources = slots
            .filter((x) => x.slots.length > 0)
            .sort((a, b) => a.date.getTime() - b.date.getTime())
            .map(({ date, slots }) =>
                slots.map((x) => {
                    x.date = new Date(
                        date.valueOf() +
                            secondsToMilliseconds(x.time.start_time)
                    ).toLocaleDateString('uk-UA', options);
                    return x;
                })
            )
            .flat()
            .filter((x) => x.gt.service.name.includes(serviceName));

        if (!resources || resources.length == 0) {
            ctx.replyWithText(`поки нема`);
            return;
        }

        const eventInfos = resources.map((x) => ({
            date: x.date as string,
            name: x.gt.name ?? x.gt.service?.name ?? serviceName,
            id: x.id,
            spaces: x.gt.space,
            usedSpaces: x.gt.used_space
        }));

        let text =
            eventInfos.length > 1 ? 'Реєстрації на цей тиждень:\n\n' : '';

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

        ctx.replyWithText(text);
    })
    .cooldown(30 as Seconds)
    .ignoreChat(ChatId.LvivChat)
    .ignoreChat(ChatId.PauperChat)
    .ignoreChat(ChatId.FrankivskChat)
    .ignoreChat(ChatId.FnmChat)
    .build();
