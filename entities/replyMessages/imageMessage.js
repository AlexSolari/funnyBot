export default class ImageMessage {
    /**
     * 
     * @param {import("telegraf/types").InputFile} image 
     * @param {Number} chatId 
     * @param {Number | undefined} replyId 
     * @param {number | string} traceId 
     */
    constructor(image, chatId, replyId, traceId){
        this.image = image;
        this.chatId = chatId;
        this.replyId = replyId;
        this.traceId = traceId;
    }
};