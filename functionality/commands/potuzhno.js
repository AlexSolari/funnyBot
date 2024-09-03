import CommandBuilder from '../../helpers/builders/commandBuilder.js';
import { pauperChat } from '../../helpers/chatIds.js';
import randomInteger from '../../helpers/randomInt.js';

export default new CommandBuilder("Reaction.Potuzhno")
    .on(/.+/i)
    .when(() => randomInteger(0, 99) == 0)
    .do(async (ctx) => {
        ctx.replyWithText("Потужно 💪");
    })
    .ignoreChat(pauperChat)
    .cooldown(14400)
    .build();