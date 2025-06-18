import { CommandActionBuilder, MessageType, Seconds } from 'chz-telegram-bot';

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
        ctx.reply.withImage('dvach');
    })
    .cooldown(1 as Seconds)
    .build();
