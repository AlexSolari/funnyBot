import CommandBuilder from '../../helpers/builders/commandBuilder.js';
import randomInteger from '../../helpers/randomInt.js';

export default new CommandBuilder("Reaction.Potuzhno")
    .on(/.+/i)
    .when(() => randomInteger(0, 99) == 0)
    .do(async (ctx) => {
        ctx.replyWithText("Потужно 💪");
    })
    .cooldown(14400)
    .build();