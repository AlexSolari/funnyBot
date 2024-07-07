import ImageMessage from "../replyMessages/imageMessage.js";
import TextMessage from "../replyMessages/textMessage.js";
import VideoMessage from "../replyMessages/videoMessage.js";
import { resolve } from "path";

/**
 * @class Context used to send a message to a chat
 */
export default class ChatContext {
    /**
     * @param {Number} chatId
     * @param {function(TextMessage | ImageMessage | VideoMessage):void} enqueueMethod
     * @param {Number | String} traceId 
     */
    constructor(enqueueMethod, chatId, traceId) {
        /** @private */
        this.enqueue = enqueueMethod;
        this.chatId = chatId;
        this.traceId = traceId;
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
};