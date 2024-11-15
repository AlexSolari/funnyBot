import { CommandActionBuilder } from '../../helpers/builders/commandActionBuilder';
import { ChatId } from '../../types/chatIds';
import { hoursToSeconds } from '../../helpers/timeConvertions';
import { Hours } from '../../types/timeValues';

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
