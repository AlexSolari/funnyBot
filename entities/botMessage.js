const randomInteger = require("../helpers/randomInt");

class BotMessage{
    constructor(ctxMessage){
        this.message_id = ctxMessage.message_id,
        this.chat = ctxMessage.chat,
        this.from = ctxMessage.from,
        this.text = ctxMessage.text

        this.traceId = randomInteger(10000, 99999);
    }
}

module.exports = BotMessage;