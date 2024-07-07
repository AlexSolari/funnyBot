export default class VideoMessage {
    /**
     * 
     * @param {import("telegraf/types").InputFile} video 
     * @param {Number} chatId 
     * @param {Number | undefined} replyId 
     */
    constructor(video, chatId, replyId){
        this.video = video;
        this.chatId = chatId;
        this.replyId = replyId;
    }
};