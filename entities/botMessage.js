class BotMessage{
    constructor(ctxMessage){
        this.message_id = ctxMessage.message_id,
        this.chat = ctxMessage.chat,
        this.from = ctxMessage.from,
        this.text = ctxMessage.text
    }
}

module.exports = BotMessage;