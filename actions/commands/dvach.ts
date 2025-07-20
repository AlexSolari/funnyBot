import { CommandActionBuilder, MessageType, Seconds } from 'chz-telegram-bot';

const DVACH_CHATID = -1001009232144;
const DVACH2_CHATID = -1001166834860;

export const dvach = new CommandActionBuilder('Reaction.Dvach')
    .on(MessageType.Forward)
    .when(
        (ctx) =>
            'forward_origin' in ctx.messageInfo.telegramUpdateObject &&
            ctx.messageInfo.telegramUpdateObject.forward_origin?.type ==
                'channel' &&
            (ctx.messageInfo.telegramUpdateObject.forward_origin.chat.id ==
                DVACH_CHATID ||
                ctx.messageInfo.telegramUpdateObject.forward_origin.chat.id ==
                    DVACH2_CHATID)
    )
    .do(async (ctx) => {
        ctx.reply.withImage('dvach');
    })
    .withCooldown({ seconds: 1 as Seconds })
    .build();
