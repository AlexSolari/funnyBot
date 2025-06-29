import { CommandActionBuilder, MessageType, Seconds } from 'chz-telegram-bot';

export default new CommandActionBuilder('Reaction.Dvach_SilentVideoForward')
    .on(MessageType.Any)
    .when(
        (ctx) =>
            ctx.messageType != MessageType.Forward &&
            'video' in ctx.messageUpdateObject &&
            ctx.messageUpdateObject.video.file_name != undefined &&
            (ctx.messageUpdateObject.video.file_name.includes('dvach') ||
                ctx.messageUpdateObject.video.file_name.includes('Двач') ||
                ctx.messageUpdateObject.video.file_name.includes('2ch'))
    )
    .do(async (ctx) => {
        ctx.reply.withImage('dvach');
    })
    .cooldown(1 as Seconds)
    .build();
