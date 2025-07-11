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
    .when(
        (ctx) =>
            ctx.messageInfo.text.length >= 400 &&
            !whitelist.includes(ctx.userInfo.id)
    )
    .do(async (ctx) => {
        ctx.reply.withImage('long');
    })
    .ignoreChat(ChatId.PauperChat)
    .cooldown(hoursToSeconds(8 as Hours))
    .build();
