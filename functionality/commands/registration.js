const CommandBuilder = require('../../helpers/commandBuilder');
const getCurrentWeek = require('../../helpers/getWeek');
const randomInteger = require('../../helpers/randomInt');
const fetch = require('node-fetch');

module.exports = new CommandBuilder("Reaction.Registration")
    .on(/рег[ау](?![a-zA-Z0-9а-яА-Я])/i)
    .do(async (api, msg, result) => {
        const currentWeek = getCurrentWeek();

        const response = await fetch(`https://api.wlaunch.net/v1/company/7ea091e0-359a-11eb-86df-9f45a44f29bd/branch/7ea10724-359a-11eb-86df-9f45a44f29bd/slot/gt/resource?start=${currentWeek.firstDay}&end=${currentWeek.lastDay}&source=WIDGET&withDiscounts=true&preventBookingEnabled=true`);
        const data = await response.json();
        const target = data.slots.map(x => x.date_slots.map(ds => ds.slots.find(dss => dss.gt.service.name == 'Піонер'))).flat(Infinity).filter(x => x)[0];

        if (!target) {
            api.reply(`пока нема`, msg.chat.id, msg.message_id);
            return;
        }

        const rnd = randomInteger(0, 3);

        let mock = '';

        switch (rnd) {
            case 0:
                mock = "пора бы самому научиться искать уже 💀";
                break;
            case 1:
                mock = "держи"
                break;
            case 2:
                mock = "заебали"
                break;
            case 3:
                mock = "";
                break;
            default:
                break;
        }

        api.reply(`${mock}\n\nhttps://w.wlaunch.net/c/magic_world/events/b/7ea10724-359a-11eb-86df-9f45a44f29bd/e/${target.id}`, msg.chat.id, msg.message_id);

    })
    .cooldown(30)
    .build();