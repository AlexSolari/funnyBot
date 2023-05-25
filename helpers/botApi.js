class BotApiHelper {
    constructor(bot) {
        this.bot = bot;
        
        this.messageQueue = [];

        setInterval(() => {
            this._dequeueMessage();
        }, 35);
    }

    _dequeueMessage(){
        const message = this.messageQueue.pop();

        if (message){
            this.bot.sendMessage(message.chatId, message.text, { parseMode: message.format ? "Markdown" : undefined, replyToMessage: message.replyId })
                .catch(e => console.error(e));
        }
    }

    send(text, chatId, format) {
        format = format || false;

        this.messageQueue.push({
            text,
            chatId,
            format,
            replyId: undefined
        });
    }

    reply(text, chatId, replyId){
        this.messageQueue.push({
            text,
            chatId,
            format: false,
            replyId
        });
    }

    gif(name, timeout, chatId) {
        const path = `./content/${name}.mp4`;
        return this.bot.sendAnimation(chatId, path)
            .then(x => setTimeout(() => this.bot.deleteMessage(chatId, x.message_id), timeout))
            .catch(e => console.error(e));
    }

    image(name, chatId, replyId) {
        const options = replyId ? { replyToMessage: replyId } : undefined;
        const path = `./content/${name}.png`;
        return this.bot.sendPhoto(chatId, path, options)
            .catch(e => console.error(e));
    }

    forward(chatId, fromChatId, msgId) {
        return this.bot.forwardMessage(chatId, fromChatId, msgId)
        .catch(e => console.error(e));
    }
}

module.exports = BotApiHelper;