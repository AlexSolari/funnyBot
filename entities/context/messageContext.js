const ImageMessage = require("../replyMessages/imageMessage");
const TextMessage = require("../replyMessages/textMessage");
const ChatContext = require("./chatContext");

class MessageContext extends ChatContext {
    constructor(enqueueMethod, chatId, messageId, text){
        super(enqueueMethod, chatId);

        this.messageId = messageId;
        this.text = text;
    }

    reply(text){
        this.enqueue(new TextMessage(text, 
            this.chatId, 
            this.messageId));
    }
    
    imageReply(name) {
        const path = `./content/${name}.png`;
        this.enqueue(new ImageMessage(path, 
            this.chatId,
            this.messageId))
    }
}

module.exports = MessageContext;