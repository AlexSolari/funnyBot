const MessageContext = require("../entities/messageContext");
const ImageMessage = require("../entities/replyMessages/imageMessage");
const TextMessage = require("../entities/replyMessages/textMessage");

class BotApiService {
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
            switch (message.constructor) {
                case TextMessage:
                    this.bot.sendMessage(message.chatId, message.text, { replyToMessage: message.replyId })
                        .catch(e => console.error(e));
                    break;
                case ImageMessage:
                    this.bot.sendPhoto(message.chatId, message.imagePath, message.replyId ? { replyToMessage: message.replyId } : undefined)
                        .catch(e => console.error(e))
                default:
                    break;
            }

        }
    }

    queue(response){
        this.messageQueue.push(response);
    }

    usingMessage(botMessage) {
        return new MessageContext(this, botMessage.chat.id, botMessage.message_id, botMessage.text);
    }

    usingChat(chatId) {
        return new MessageContext(this, chatId, undefined, undefined);
    }
}

module.exports = BotApiService;