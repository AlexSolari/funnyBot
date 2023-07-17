const ImageMessage = require("../replyMessages/imageMessage");
const TextMessage = require("../replyMessages/textMessage");

class ChatContext{
    constructor(enqueueMethod, chatId){
        this.enqueue = enqueueMethod;
        this.chatId = chatId;
    }
    
    send(text) {
        this.enqueue(new TextMessage(text, 
            this.chatId, 
            undefined));
    }

    image(name) {
        const path = `./content/${name}.png`;
        this.enqueue(new ImageMessage(path, 
            this.chatId,
            undefined))
    }
}

module.exports = ChatContext;