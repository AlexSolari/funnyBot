const CommandBuilder = require('../../helpers/commandBuilder');
const chatIds = require('../../helpers/chatIds');

module.exports = new CommandBuilder("Reaction.Ihor")
    .on("модерн")
    .do(async (ctx) => {
        if (ctx.from != 381992977){
            return;
        }
        
        ctx.replyWithImage("ihor");
    })
    .cooldown(7200)
    .ignoreChat(chatIds.lvivChat)
    .build();