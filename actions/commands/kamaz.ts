import { CommandActionBuilder, Hours } from 'chz-telegram-bot';
import { ChatId } from '../../types/chatIds';
import { hoursToSeconds } from 'chz-telegram-bot/dist/helpers/timeConvertions';

export default new CommandActionBuilder('Reaction.Kamaz')
    .on(/камаз/i)
    .do(async (ctx) => {
        ctx.reply.withImage('kamazGun');
    })
    .cooldown(hoursToSeconds(2 as Hours))
    .ignoreChat(ChatId.LvivChat)
    .ignoreChat(ChatId.PauperChat)
    .ignoreChat(ChatId.FrankivskChat)
    .ignoreChat(ChatId.GenshinChat)
    .ignoreChat(ChatId.CbgChat)
    .build();
