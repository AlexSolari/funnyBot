import { CommandActionBuilder, Hours, MessageType } from 'chz-telegram-bot';
import { ChatId } from '../../types/chatIds';
import { hoursToSeconds } from 'chz-telegram-bot/dist/helpers/timeConvertions';
import { SpecificUsers } from '../../types/userIds';

const whitelist = [SpecificUsers.nerdik, SpecificUsers.otabapa];

export default new CommandActionBuilder('Reaction.Long')
    .on(MessageType.Text)
    .when(
        (ctx) =>
            ctx.messageText.length >= 400 &&
            !whitelist.includes(ctx.fromUserId!)
    )
    .do(async (ctx) => {
        ctx.reply.withImage('long');
    })
    .ignoreChat(ChatId.PauperChat)
    .cooldown(hoursToSeconds(8 as Hours))
    .build();
