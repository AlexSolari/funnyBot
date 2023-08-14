class VideoMessage {
    constructor(videoPath, chatId, replyId){
        this.videoPath = videoPath;
        this.chatId = chatId;
        this.replyId = replyId;
    }
}

module.exports = VideoMessage;