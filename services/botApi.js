const MessageContext = require("../entities/context/messageContext");
const ChatContext = require("../entities/context/chatContext");
const ImageMessage = require("../entities/replyMessages/imageMessage");
const TextMessage = require("../entities/replyMessages/textMessage");
const VideoMessage = require("../entities/replyMessages/videoMessage");
const taskScheduler = require('../services/taskScheduler');
const telebot = require("telebot");

class BotApiService {
    /**
    * @param {telebot} bot
    */
    constructor(bot) {
        this.bot = bot;

        /**
         * @type {Array<TextMessage | ImageMessage | VideoMessage>}
         */
        this.messageQueue = [];

        taskScheduler.createTask("MessageSending", () => {
            this._dequeueMessage();
        }, 35);
    }

    _dequeueMessage() {
        const message = this.messageQueue.pop();

        if (message) {
            switch (message.constructor) {
                case TextMessage:
                    this.bot.sendMessage(message.chatId, message.text, { replyToMessage: message.replyId, parseMode: "MarkdownV2" })
                        .catch(e => console.error(e));
                    break;
                case ImageMessage:
                    this.bot.sendPhoto(message.chatId, message.imagePath, message.replyId ? { replyToMessage: message.replyId } : undefined)
                        .catch(e => console.error(e));
                case VideoMessage:
                    this.bot.sendVideo(message.chatId, message.videoPath, message.replyId ? { replyToMessage: message.replyId } : undefined)
                        .catch(e => console.error(e));
                default:
                    break;
            }

        }
    }

    enqueue(response) {
        this.messageQueue.push(response);
    }

    usingMessage(botMessage) {
        return new MessageContext((response) => this.enqueue(response), botMessage.chat.id, botMessage.message_id, botMessage.text, botMessage.from?.id ?? undefined);
    }

    usingChat(chatId) {
        return new ChatContext((response) => this.enqueue(response), chatId);
    }
}

module.exports = BotApiService;