import { MessageType } from 'chz-telegram-bot';
import { chatAdmins } from '../../types/userIds';
import { CommandBuilder } from '../../helpers/commandBuilder';

export const long = new CommandBuilder('Reaction.Long')
    .on(MessageType.Text)
    .when(
        (ctx) =>
            !ctx.messageInfo.text.includes('send.monobank') &&
            ctx.messageInfo.text.length >= 400 &&
            !chatAdmins.includes(ctx.userInfo.id)
    )
    .do(async (ctx) => {
        ctx.reply.withImage('long');
    })
    .build();
