import CommandBuilder from '../../helpers/builders/commandBuilder.js';
import getCurrentWeek from '../../helpers/getWeek.js';
import { pioneerChat, modernChat, lvivChat, standardChat, pauperChat } from '../../helpers/chatIds.js';
import escapeMarkdown from '../../helpers/escapeMarkdown.js';

export default new CommandBuilder("Reaction.Registration")
    .on(["рега", "Рега"])
    .do(async (ctx) => {
        let serviceName = '';

        switch (ctx.chatId) {
            case pioneerChat:
                serviceName = 'Піонер';
                break;
            case modernChat:
                serviceName = 'Модерн';
                break;
            case standardChat:
                serviceName = 'Стандарт';
                break;
            default:
                ctx.startCooldown = false;
                return;
        }

        const currentWeek = getCurrentWeek();

        const response = await fetch(`https://api.wlaunch.net/v1/company/7ea091e0-359a-11eb-86df-9f45a44f29bd/branch/7ea10724-359a-11eb-86df-9f45a44f29bd/slot/gt/resource?start=${currentWeek.firstDay}&end=${currentWeek.lastDay}&source=WIDGET&withDiscounts=true&preventBookingEnabled=true`);
        const data = await response.json();
        const resources = data.slots.map(x => x.date_slots.map(ds => ds.slots.find(dss => dss.gt.service.name.indexOf(serviceName) != -1))).flat(Infinity).filter(x => x);

        if (!resources || resources.length == 0) {
            ctx.replyWithText(`поки нема`);
            return;
        }

        const eventInfos = resources.map(x => ({
            name: x.gt.name ?? x.gt.service?.name ?? serviceName,
            id: x.id,
            spaces: x.gt.space,
            usedSpaces: x.gt.used_space
        }));

        let text = eventInfos.length > 1
            ? 'Реєстрації на цей тиждень:\n\n'
            : '';

        eventInfos.forEach((x, i) => {
            text += `[${escapeMarkdown(x.name)}](https://w.wlaunch.net/c/magic_world/events/b/7ea10724-359a-11eb-86df-9f45a44f29bd/e/${x.id}) \\(${x.usedSpaces} уже в резі\\)`;

            if ((i + 1) < eventInfos.length)
                text += '\n';
        });

        ctx.replyWithText(text);
    })
    .cooldown(30)
    .ignoreChat(lvivChat)
    .ignoreChat(pauperChat)
    .build();