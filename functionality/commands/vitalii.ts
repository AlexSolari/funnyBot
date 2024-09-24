import { CommandBuilder } from '../../helpers/builders/commandBuilder';
import { ChatId } from '../../helpers/chatIds';
import { SpecificUsers } from '../../helpers/userIds';

export default new CommandBuilder("Reaction.Vitalii")
    .on(/маліфо/i)
    .from(SpecificUsers.vitalii)
    .when(async (ctx) => ctx.chatId == ChatId.LvivChat)
    .do(async (ctx) => {
        ctx.replyWithImage("malifo");
    })
    .cooldown(86400)
    .build();