import { CommandActionBuilder, Hours, MessageType } from 'chz-telegram-bot';
import { hoursToSeconds } from 'chz-telegram-bot/dist/helpers/timeConvertions';

const DVACH_CHATID = -1001009232144;
const DVACH2_CHATID = -1001166834860;

export default new CommandActionBuilder('Reaction.Dvach')
    .on(MessageType.Forward)
    .when(
        (ctx) =>
            'forward_origin' in ctx.messageUpdateObject &&
            ctx.messageUpdateObject.forward_origin?.type == 'channel' &&
            (ctx.messageUpdateObject.forward_origin.chat.id == DVACH_CHATID ||
                ctx.messageUpdateObject.forward_origin.chat.id == DVACH2_CHATID)
    )
    .do(async (ctx) => {
        ctx.replyWithImage('dvach');
    })
    .cooldown(hoursToSeconds(1 as Hours))
    .build();
