import ScheduledActionBuilder from '../../helpers/builders/scheduledActionBuilder';
import getCurrentWeek from '../../helpers/getWeek';
import moment from 'moment';
import {
    IMWApiResponse,
    IMWEventDetail
} from '../../types/externalApiDefinitions/mw';
import { ChatId } from '../../types/chatIds';
import { hoursToSeconds } from '../../helpers/timeConvertions';
import { Day } from '../../types/daysOfTheWeek';
import { Hours } from '../../types/timeValues';

export default new ScheduledActionBuilder('Scheduled.LowCount')
    .runAt(8)
    .allowIn(ChatId.PioneerChat)
    .allowIn(ChatId.ModernChat)
    .do(async (ctx) => {
        const currentWeek = getCurrentWeek();
        const today = moment().day();

        if (today >= Day.Friday || today == Day.Sunday) {
            const response = await fetch(
                `https://api.wlaunch.net/v1/company/7ea091e0-359a-11eb-86df-9f45a44f29bd/branch/7ea10724-359a-11eb-86df-9f45a44f29bd/slot/gt/resource?start=${currentWeek.firstDay}&end=${currentWeek.lastDay}&source=WIDGET&withDiscounts=true&preventBookingEnabled=true`
            );
            let prefix = '';
            let serviceName = '';

            switch (ctx.chatId) {
                case ChatId.PioneerChat:
                    prefix = 'pioneer_';
                    serviceName = 'Піонер';
                    break;
                case ChatId.ModernChat:
                    prefix = 'modern_';
                    serviceName = 'Модерн';
                    break;
                default:
                    return;
            }

            const data = (await response.json()) as IMWApiResponse;
            const target = data.slots
                .map((x) =>
                    x.date_slots.map((ds) =>
                        ds.slots.find(
                            (dss) => dss.gt.service.name == serviceName
                        )
                    )
                )
                .flat(Infinity)
                .filter((x) => x)[0] as IMWEventDetail;

            if (!target) return;

            if (
                today == Day.Sunday &&
                target.time.start_time < hoursToSeconds(12 as Hours)
            )
                return;

            if (target.gt.used_space == 7 || target.gt.used_space == 9) {
                ctx.sendImageToChat(`${prefix}${target.gt.used_space}people`);
            } else if (target.gt.used_space <= 6) {
                ctx.sendImageToChat(`${prefix}nopeople`);
            }
        }
    })
    .build();
