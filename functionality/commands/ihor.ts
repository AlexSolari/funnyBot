import { CommandBuilder } from '../../helpers/builders/commandBuilder';
import { ChatId } from '../../helpers/chatIds';
import { SpecificUsers } from '../../helpers/userIds';

export default new CommandBuilder("Reaction.Ihor")
    .on(/мод[еє]рн/i)
    .from(SpecificUsers.ihor)
    .when(async (ctx) => ctx.chatId == ChatId.LvivChat)
    .do(async (ctx) => {
        ctx.replyWithImage("ihor");
    })
    .cooldown(7200)
    .disabled()
    .build();