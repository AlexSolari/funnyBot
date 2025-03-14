import { CommandActionBuilder, Hours } from 'chz-telegram-bot';
import { ChatId } from '../../types/chatIds';
import { hoursToSeconds } from 'chz-telegram-bot/dist/helpers/timeConvertions';

export default new CommandActionBuilder('Reaction.Ponyav')
    .on('поняв')
    .do(async (ctx) => {
        ctx.replyWithText('в штани намоняв');
    })
    .cooldown(hoursToSeconds(2 as Hours))
    .ignoreChat(ChatId.LvivChat)
    .ignoreChat(ChatId.PauperChat)
    .ignoreChat(ChatId.FrankivskChat)
    .ignoreChat(ChatId.ModernChat)
    .ignoreChat(ChatId.SpellSeeker)
    .ignoreChat(ChatId.PioneerChat)
    .ignoreChat(ChatId.StandardChat)
    .build();
