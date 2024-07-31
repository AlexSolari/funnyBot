import CommandBuilder from '../../helpers/builders/commandBuilder.js';
import randomInteger from '../../helpers/randomInt.js';

export default new CommandBuilder("Reaction.Potuzhno")
    .on(/.+/i)
    .do(async (ctx) => {
        if (randomInteger(0, 99) == 0) {
            ctx.replyWithText("Потужно 💪");
        }
        else{
            ctx.startCooldown = false;
        }
    })
    .cooldown(14400)
    .build();