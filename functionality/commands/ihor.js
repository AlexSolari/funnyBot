const CommandBuilder = require('../../helpers/commandBuilder');
const chatIds = require('../../helpers/chatIds');

module.exports = new CommandBuilder("Reaction.Ihor")
    .on(/мод[еє]рн/i)
    .do(async (ctx) => {
        console.log("[Ihor] triggered by " + ctx.fromUserId)

        if (ctx.fromUserId != 381992977){
            ctx.startCooldown = false;
            return;
        }
        
        ctx.replyWithImage("ihor");
    })
    .cooldown(7200)
    .build();