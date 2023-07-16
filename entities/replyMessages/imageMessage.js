class ImageMessage {
    constructor(imagePath, chatId, replyId){
        this.imagePath = imagePath;
        this.chatId = chatId;
        this.replyId = replyId;
    }
}

module.exports = ImageMessage;