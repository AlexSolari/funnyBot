import { CommandActionBuilder, Hours } from 'chz-telegram-bot';
import { ChatId } from '../../../types/chatIds';
import { hoursToSeconds } from 'chz-telegram-bot/dist/helpers/timeConvertions';

export default new CommandActionBuilder('Reaction.Rakdos')
    .on(/(ракдос|рб|бр)(?![a-zA-Z0-9а-яА-Я])/i)
    .do(async (ctx) => {
        ctx.replyWithImage('rakdos');
    })
    .cooldown(hoursToSeconds(2 as Hours))
    .ignoreChat(ChatId.LvivChat)
    .ignoreChat(ChatId.PauperChat)
    .ignoreChat(ChatId.FrankivskChat)
    .ignoreChat(ChatId.GenshinChat)
    .disabled()
    .build();
