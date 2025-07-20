import { CommandActionBuilder, MessageType, Seconds } from 'chz-telegram-bot';

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
