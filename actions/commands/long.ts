import {
    CommandActionBuilder,
    Hours,
    MessageType,
    hoursToSeconds
} from 'chz-telegram-bot';
import { ChatId } from '../../types/chatIds';
import { SpecificUsers } from '../../types/userIds';

const whitelist = [SpecificUsers.nerdik, SpecificUsers.otabapa];

export default new CommandActionBuilder('Reaction.Long')
    .on(MessageType.Text)
    .notIn([ChatId.PauperChat])
    .when(
        (ctx) =>
            !ctx.messageInfo.text.includes('send.monobank') &&
            ctx.messageInfo.text.length >= 400 &&
            !whitelist.includes(ctx.userInfo.id)
    )
    .do(async (ctx) => {
        ctx.reply.withImage('long');
    })
    .withCooldown({ seconds: hoursToSeconds(20 as Hours) })
    .build();
