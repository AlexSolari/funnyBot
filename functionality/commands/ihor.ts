import { CommandActionBuilder } from '../../helpers/builders/commandActionBuilder';
import { ChatId } from '../../helpers/chatIds';
import { SpecificUsers } from '../../helpers/userIds';

export default new CommandActionBuilder("Reaction.Ihor")
    .on(/мод[еє]рн/i)
    .from(SpecificUsers.ihor)
    .when(async (ctx) => ctx.chatId == ChatId.LvivChat)
    .do(async (ctx) => {
        ctx.replyWithImage("ihor");
    })
    .cooldown(7200)
    .disabled()
    .build();