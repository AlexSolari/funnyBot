import { MessageType } from 'chz-telegram-bot';
import { SpecificUsers } from '../../types/userIds';
import { CommandBuilder } from '../../helpers/commandBuilder';

const whitelist = [SpecificUsers.nerdik, SpecificUsers.otabapa];

export const long = new CommandBuilder('Reaction.Long')
    .on(MessageType.Text)
    .when(
        (ctx) =>
            !ctx.messageInfo.text.includes('send.monobank') &&
            ctx.messageInfo.text.length >= 400 &&
            !whitelist.includes(ctx.userInfo.id)
    )
    .do(async (ctx) => {
        ctx.reply.withImage('long');
    })
    .build();
