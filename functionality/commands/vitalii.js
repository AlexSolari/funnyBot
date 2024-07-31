import CommandBuilder from '../../helpers/builders/commandBuilder.js';
import { lvivChat } from '../../helpers/chatIds.js';
import userIds from '../../helpers/userIds.js';

export default new CommandBuilder("Reaction.Vitalii")
    .on(/маліфо/i)
    .from(userIds.vitalii)
    .when((ctx) => ctx.chatId == lvivChat)
    .do((ctx) => {
        ctx.replyWithImage("malifo");
    })
    .cooldown(86400)
    .build();