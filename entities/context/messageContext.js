const ImageMessage = require("../replyMessages/imageMessage");
const TextMessage = require("../replyMessages/textMessage");
const VideoMessage = require("../replyMessages/videoMessage");
const ChatContext = require("./chatContext");

class MessageContext extends ChatContext {
    constructor(enqueueMethod, chatId, messageId, text){
        super(enqueueMethod, chatId);

        this.messageId = messageId;
        this.text = text;
        this.matchResult = null;
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

    videoReply(name) {
        const path = `./content/${name}.png`;
        this.enqueue(new VideoMessage(path, 
            this.chatId,
            this.messageId))
    }
}

module.exports = MessageContext;