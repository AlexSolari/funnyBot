export default class TextMessage {
    constructor(text, chatId, replyId, traceId){
        this.text = text;
        this.chatId = chatId;
        this.replyId = replyId;
        this.traceId = traceId;
    }
};