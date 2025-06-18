import { CommandActionBuilder, Hours } from 'chz-telegram-bot';
import { ChatId } from '../../types/chatIds';
import { hoursToSeconds } from 'chz-telegram-bot/dist/helpers/timeConvertions';

export default new CommandActionBuilder('Reaction.Ponyav')
    .on('поняв')
    .do(async (ctx) => {
        ctx.reply.withText('в штани намоняв');
    })
    .cooldown(hoursToSeconds(2 as Hours))
    .ignoreChat(ChatId.PauperChat)
    .ignoreChat(ChatId.FrankivskChat)
    .ignoreChat(ChatId.SpellSeeker)
    .ignoreChat(ChatId.StandardChat)
    .ignoreChat(ChatId.GenshinChat)
    .build();
