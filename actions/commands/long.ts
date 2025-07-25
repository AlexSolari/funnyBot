import { CommandActionBuilder, MessageType } from 'chz-telegram-bot';
import { SpecificUsers } from '../../types/userIds';
import { featureSetConfiguration } from '../../helpers/getFeatures';

const whitelist = [SpecificUsers.nerdik, SpecificUsers.otabapa];

export const long = new CommandActionBuilder('Reaction.Long')
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
    .withConfiguration(() => featureSetConfiguration)
    .build();
