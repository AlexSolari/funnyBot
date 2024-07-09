export default class VideoMessage {
    /**
     * 
     * @param {import("telegraf/types").InputFile} video 
     * @param {Number} chatId 
     * @param {Number | undefined} replyId 
     * @param {number | string} traceId 
     */
    constructor(video, chatId, replyId, traceId){
        this.video = video;
        this.chatId = chatId;
        this.replyId = replyId;
        this.traceId = traceId;
    }
};