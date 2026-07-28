import { ChatId } from '../../types/chatIds';
import { ScheduledActionBuilder } from 'chz-telegram-bot';
import { Day } from '../../types/daysOfTheWeek';
import moment from 'moment';
import { mtgrdleService } from '../../services/mtgrdleService';

export const mtgrdle = new ScheduledActionBuilder('Scheduled.Mtgrdle')
    .runAt(0)
    .in([
        ChatId.PioneerChat,
        ChatId.LvivChat,
        ChatId.CbgChat,
        ChatId.PauperChat
    ])
    .do(async (ctx) => {
        const today = moment().day();
        const isWeekend = today == Day.Sunday || today == Day.Saturday;
        if (ctx.chatInfo.id == ChatId.LvivChat && !isWeekend) {
            return;
        }

        await mtgrdleService.startGame(ctx);
    })
    .build();
