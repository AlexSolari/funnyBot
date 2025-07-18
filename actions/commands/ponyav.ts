import { CommandActionBuilder, Hours, hoursToSeconds } from 'chz-telegram-bot';
import { ChatId } from '../../types/chatIds';

export default new CommandActionBuilder('Reaction.Ponyav')
    .on('поняв')
    .notIn([
        ChatId.PauperChat,
        ChatId.FrankivskChat,
        ChatId.SpellSeeker,
        ChatId.StandardChat,
        ChatId.GenshinChat
    ])
    .do(async (ctx) => {
        ctx.reply.withText('в штани намоняв');
    })
    .withCooldown({ seconds: hoursToSeconds(2 as Hours) })
    .build();
