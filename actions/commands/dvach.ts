import { CommandActionBuilder, MessageType, Seconds } from 'chz-telegram-bot';

const DVACH_CHATID = -1001009232144;
const DVACH2_CHATID = -1001166834860;
const DVACH_LIGHTNING_ID = '5359617799515823946';

export const dvachForward = new CommandActionBuilder('Reaction.Dvach')
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

export const dvachLightning = new CommandActionBuilder(
    'Reaction.DvachLightning'
)
    .on(/⚡️/gi)
    .when(
        (ctx) =>
            'entities' in ctx.messageInfo.telegramUpdateObject &&
            ctx.messageInfo.telegramUpdateObject.entities?.find(
                (x) =>
                    x.type == 'custom_emoji' &&
                    x.custom_emoji_id == DVACH_LIGHTNING_ID
            ) != undefined
    )
    .do(async (ctx) => {
        ctx.reply.withImage('dvach');
    })
    .withCooldown({ seconds: 1 as Seconds })
    .build();

export const dvachSilentForward = new CommandActionBuilder(
    'Reaction.Dvach_SilentVideoForward'
)
    .on(MessageType.Any)
    .when(
        (ctx) =>
            ctx.messageInfo.type != MessageType.Forward &&
            'video' in ctx.messageInfo.telegramUpdateObject &&
            ctx.messageInfo.telegramUpdateObject.video.file_name != undefined &&
            (ctx.messageInfo.telegramUpdateObject.video.file_name.includes(
                'dvach'
            ) ||
                ctx.messageInfo.telegramUpdateObject.video.file_name.includes(
                    'Двач'
                ) ||
                ctx.messageInfo.telegramUpdateObject.video.file_name.includes(
                    '2ch'
                ))
    )
    .do(async (ctx) => {
        ctx.reply.withImage('dvach');
    })
    .withCooldown({ seconds: 1 as Seconds })
    .build();
