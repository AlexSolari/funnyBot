const ImageMessage = require("../replyMessages/imageMessage");
const TextMessage = require("../replyMessages/textMessage");
const VideoMessage = require("../replyMessages/videoMessage");

/**
 * @class Context used to send a message to a chat
 */
class ChatContext {
    /**
     * @param {Number} chatId
     * @param {function(TextMessage | ImageMessage | VideoMessage):void} enqueueMethod
     */
    constructor(enqueueMethod, chatId) {
        /** @private */
        this.enqueue = enqueueMethod;
        this.chatId = chatId;
    }

    /**
     * @method
     * @param {string} text 
     */
    sendTextToChat(text) {
        this.enqueue(new TextMessage(text,
            this.chatId,
            undefined));
    }

    /**
     * @method
     * @param {string} name 
     */
    sendImageToChat(name) {
        const filePath = `./content/${name}.png`;
        this.enqueue(new ImageMessage(
            { source: resolve(filePath) },
            this.chatId,
            undefined))
    }

    /**
     * @method
     * @param {string} name 
     */
    sendVideoToChat(name) {
        const filePath = `./content/${name}.mp4`;
        this.enqueue(new VideoMessage(
            { source: resolve(filePath) },
            this.chatId,
            undefined))
    }
}

module.exports = ChatContext;