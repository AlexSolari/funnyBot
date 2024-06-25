class ImageMessage {
    /**
     * 
     * @param {import("telegraf/types").InputFile} image 
     * @param {Number} chatId 
     * @param {Number | undefined} replyId 
     */
    constructor(image, chatId, replyId){
        this.image = image;
        this.chatId = chatId;
        this.replyId = replyId;
    }
}

module.exports = ImageMessage;