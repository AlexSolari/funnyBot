import { CommandBuilder } from '../../helpers/builders/commandBuilder';
import { ChatId } from '../../helpers/chatIds';
import randomInteger from '../../helpers/randomInt';

export default new CommandBuilder("Reaction.Lotus")
    .on(/лотус/i)
    .do(async (ctx) => {
        let imageName = randomInteger(0, 1)
            ? "dampingSphere_funny"
            : "dampingSphere";

        if (imageName == "dampingSphere_funny") {
            imageName += randomInteger(1, 3);
        }

        ctx.replyWithImage(imageName);
    })
    .ignoreChat(ChatId.LvivChat)
    .ignoreChat(ChatId.PauperChat)
    .cooldown(7200)
    .build();