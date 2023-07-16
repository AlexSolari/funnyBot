const ImageMessage = require("./replyMessages/imageMessage");
const TextMessage = require("./replyMessages/textMessage");

class MessageContext {
    constructor(botApi, chatId, messageId, text){
        this.botApi = botApi;
        this.chatId = chatId;
        this.messageId = messageId;
        this.text = text;
    }

    
    send(text) {
        this.botApi.queue(new TextMessage(text, 
            this.chatId, 
            undefined));
    }

    reply(text){
        this.botApi.queue(new TextMessage(text, 
            this.chatId, 
            this.messageId));
    }

    image(name) {
        const path = `./content/${name}.png`;
        this.botApi.queue(new ImageMessage(path, 
            this.chatId,
            undefined))
    }

    imageReply(name) {
        const path = `./content/${name}.png`;
        this.botApi.queue(new ImageMessage(path, 
            this.chatId,
            this.messageId))
    }
}

module.exports = MessageContext;