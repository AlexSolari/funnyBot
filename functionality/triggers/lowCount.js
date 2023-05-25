const TriggerBuilder = require('../../helpers/triggerBuilder');
const getCurrentWeek = require('../../helpers/getWeek');
const fetch = require('node-fetch');

module.exports = new TriggerBuilder("Trigger.LowCount")
    .at(11) //15:00 Kiev time
    .do((api, chatId) => {
        const currentWeek = getCurrentWeek();
        const today = new Date().getDay();

        if (today >= 5 || today == 0) {

            fetch(`https://api.wlaunch.net/v1/company/7ea091e0-359a-11eb-86df-9f45a44f29bd/branch/7ea10724-359a-11eb-86df-9f45a44f29bd/slot/gt/resource?start=${currentWeek.firstDay}&end=${currentWeek.lastDay}&source=WIDGET&withDiscounts=true&preventBookingEnabled=true`)
                .then(x => x.json())
                .then(data => {
                    const target = data.slots.map(x => x.date_slots.map(ds => ds.slots.find(dss => dss.gt.service.name == 'Піонер'))).flat(Infinity).filter(x => x)[0];

                    if (!target)
                        return;

                    if (today == 0 && target.time.start_time != 57600)
                        return;

                    if (target.gt.used_space == 7 || target.gt.used_space == 9) {
                        api.image(`${target.gt.used_space}people`, chatId, null);
                    } else if (target.gt.used_space <= 6) {
                        api.image(`nopeople`, chatId, null);
                    }
                });

        }
    })
    .build();