import { CommandBuilder } from '../../helpers/builders/commandBuilder';
import getCurrentWeek from '../../helpers/getWeek';
import escapeMarkdown from '../../helpers/escapeMarkdown';
import { IMWApiResponse, IMwApiResponseDateSlot } from '../../entities/externalApiDefinitions/mw';
import { ChatId } from '../../helpers/chatIds';

export default new CommandBuilder("Reaction.Registration")
    .on(["рега", "Рега"])
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
        } as Intl.DateTimeFormatOptions;

        const response = await fetch(`https://api.wlaunch.net/v1/company/7ea091e0-359a-11eb-86df-9f45a44f29bd/branch/7ea10724-359a-11eb-86df-9f45a44f29bd/slot/gt/resource?start=${currentWeek.firstDay}&end=${currentWeek.lastDay}&source=WIDGET&withDiscounts=true&preventBookingEnabled=true`);
        const data = await response.json() as IMWApiResponse;
        const resources = (data.slots
            .map(x => x.date_slots.map(ds => ({ date: new Date(ds.date), slots: ds.slots } as IMwApiResponseDateSlot)))
            .flat(Infinity) as IMwApiResponseDateSlot[])
            .filter(x => x.slots.length > 0)
            .sort((a, b) => a.date.getTime() - b.date.getTime())
            .map(({ date, slots }) => slots.map(x => { x.date = date.toLocaleDateString("uk-UA", options); return x }))
            .flat()
            .filter(x => x.gt.service.name.indexOf(serviceName) != -1);

        if (!resources || resources.length == 0) {
            ctx.replyWithText(`поки нема`);
            return;
        }

        const eventInfos = resources.map(x => ({
            date: x.date as string,
            name: x.gt.name ?? x.gt.service?.name ?? serviceName,
            id: x.id,
            spaces: x.gt.space,
            usedSpaces: x.gt.used_space
        }));

        let text = eventInfos.length > 1
            ? 'Реєстрації на цей тиждень:\n\n'
            : '';

        eventInfos.forEach((x, i) => {
            text += `[${escapeMarkdown(x.name)}](https://w.wlaunch.net/c/magic_world/events/b/7ea10724-359a-11eb-86df-9f45a44f29bd/e/${x.id}) \\(${x.usedSpaces} уже в резі\\) відбудеться у ${escapeMarkdown(x.date)}`;

            if ((i + 1) < eventInfos.length)
                text += '\n';
        });

        ctx.replyWithText(text);
    })
    .cooldown(30)
    .ignoreChat(ChatId.LvivChat)
    .ignoreChat(ChatId.PauperChat)
    .build();