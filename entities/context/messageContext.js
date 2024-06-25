const ImageMessage = require("../replyMessages/imageMessage");
const TextMessage = require("../replyMessages/textMessage");
const VideoMessage = require("../replyMessages/videoMessage");
const ChatContext = require("./chatContext");
const { resolve } = require("path");

/**@class Context used to reply to specific message that triggered a command*/
class MessageContext extends ChatContext {
    /**
     * @extends ChatContext
     * @param {function(TextMessage | ImageMessage | VideoMessage):void} enqueueMethod
     * @param {Number} chatId
     * @param {Number} messageId 
     * @param {Number} fromUserId 
     * @param {String} messageText 
     */
    constructor(enqueueMethod, chatId, messageId, messageText, fromUserId) {
        super(enqueueMethod, chatId);

        this.messageId = messageId;
        this.messageText = messageText;
        /** @type {RegExpExecArray | null} */
        this.matchResult = null;
        this.fromUserId = fromUserId;
        this.startCooldown = true;
    }

    /** 
     * @method
     * @param {String} text */
    replyWithText(text) {
        this.enqueue(new TextMessage(text,
            this.chatId,
            this.messageId));
    }

    /** 
     * @method
     * @param {String} name */
    replyWithImage(name) {
        
        const filePath = `./content/${name}.png`;
        this.enqueue(new ImageMessage(
            { source: resolve(filePath) },
            this.chatId,
            this.messageId))
    }

    /** 
     * @method
     * @param {String} name */
    replyWithVideo(name) {
        const filePath = `./content/${name}.mp4`;
        this.enqueue(new VideoMessage(
            { source: resolve(filePath) },
            this.chatId,
            this.messageId))
    }
}

module.exports = MessageContext;