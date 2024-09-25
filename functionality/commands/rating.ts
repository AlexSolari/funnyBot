import { CommandActionBuilder } from '../../helpers/builders/commandActionBuilder';
import { ChatId } from '../../helpers/chatIds';
import randomInteger from '../../helpers/randomInt';

export default new CommandActionBuilder("Reaction.Rating")
    .on(/youtube\.com\/watch\?/i)
    .when(async () => randomInteger(0, 1) == 0)
    .do(async (ctx) => {
        ctx.replyWithImage("bad");
    })
    .cooldown(7200)
    .ignoreChat(ChatId.LvivChat)
    .build();