const CommandBuilder = require('../../helpers/commandBuilder');
const getCurrentWeek = require('../../helpers/getWeek');
const fetch = require('node-fetch');
const chatIds = require('../../helpers/chatIds');

module.exports = new CommandBuilder("Reaction.Registration")
    .on(["рега", "Рега"])
    .do(async (ctx) => {
        if (ctx.from == 405833560){
            ctx.replyWithText("Посмотри в закрепе 👀");
            return;
        }

        const currentWeek = getCurrentWeek();
        const response = await fetch(`https://api.wlaunch.net/v1/company/7ea091e0-359a-11eb-86df-9f45a44f29bd/branch/7ea10724-359a-11eb-86df-9f45a44f29bd/slot/gt/resource?start=${currentWeek.firstDay}&end=${currentWeek.lastDay}&source=WIDGET&withDiscounts=true&preventBookingEnabled=true`);

        let serviceName = '';

        switch (ctx.chatId) {
            case chatIds.pioneerChat:
                serviceName = 'Піонер'
                break;
            case chatIds.modernChat:
                serviceName = 'Модерн'
                break;
            default:
                return;
        }

        const data = await response.json();
        const target = data.slots.map(x => x.date_slots.map(ds => ds.slots.find(dss => dss.gt.service.name.indexOf(serviceName) != -1))).flat(Infinity).filter(x => x)[0];

        if (!target) {
            ctx.replyWithText(`пока нема`);
            return;
        }

        ctx.replyWithText(`[${serviceName}](https://w.wlaunch.net/c/magic_world/events/b/7ea10724-359a-11eb-86df-9f45a44f29bd/e/${target.id})`);

    })
    .cooldown(30)
    .ignoreChat(chatIds.lvivChat)
    .build();