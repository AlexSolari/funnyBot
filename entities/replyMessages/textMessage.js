class TextMessage {
    constructor(text, chatId, replyId){
        this.text = text;
        this.chatId = chatId;
        this.replyId = replyId;
    }
}

module.exports = TextMessage;