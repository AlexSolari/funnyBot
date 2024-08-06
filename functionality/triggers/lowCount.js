import TriggerBuilder from '../../helpers/builders/triggerBuilder.js';
import getCurrentWeek from '../../helpers/getWeek.js';
import { modernChat, pioneerChat } from '../../helpers/chatIds.js';
import moment from "moment";

export default new TriggerBuilder("Trigger.LowCount")
    .at(8) //08:00 Kiev time
    .allowIn([modernChat, pioneerChat])
    .do(async (ctx) => {
        const currentWeek = getCurrentWeek();
        const today = moment().day();

        if (today >= 5 || today == 0) {
            const response = await fetch(`https://api.wlaunch.net/v1/company/7ea091e0-359a-11eb-86df-9f45a44f29bd/branch/7ea10724-359a-11eb-86df-9f45a44f29bd/slot/gt/resource?start=${currentWeek.firstDay}&end=${currentWeek.lastDay}&source=WIDGET&withDiscounts=true&preventBookingEnabled=true`)
            let prefix = '';
            let serviceName = '';

            switch (ctx.chatId) {
                case pioneerChat:
                    prefix = 'pioneer_';
                    serviceName = 'Піонер';
                    break;
                case modernChat:
                    prefix = 'modern_';
                    serviceName = 'Модерн';
                    break;
                default:
                    return;
            }

            const data = await response.json();
            const target = data.slots
                .map(x => x.date_slots.map(ds => ds.slots.find(dss => dss.gt.service.name == serviceName)))
                .flat(Infinity)
                .filter(x => x)[0];

            if (!target)
                return;

            if (today == 0 && target.time.start_time != 57600)
                return;

            if (target.gt.used_space == 7 || target.gt.used_space == 9) {
                ctx.sendImageToChat(`${prefix}${target.gt.used_space}people`);
            } else if (target.gt.used_space <= 6) {
                ctx.sendImageToChat(`${prefix}nopeople`);
            }

        }
    })
    .build();