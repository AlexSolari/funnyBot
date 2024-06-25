const MessageContext = require("../entities/context/messageContext");
const ChatContext = require("../entities/context/chatContext");
const ImageMessage = require("../entities/replyMessages/imageMessage");
const TextMessage = require("../entities/replyMessages/textMessage");
const VideoMessage = require("../entities/replyMessages/videoMessage");
const taskScheduler = require('../services/taskScheduler');
const { Telegraf } = require("telegraf");
const BotMessage = require("../entities/botMessage");

class BotApiService {
    /**
    * @param {Telegraf} bot
    */
    constructor(bot) {
        this.bot = bot;

        /**
         * @type {Array<TextMessage | ImageMessage | VideoMessage>}
         */
        this.messageQueue = [];

        taskScheduler.createTask("MessageSending", () => {
            this._dequeueMessage();
        }, 100);
    }

    async _dequeueMessage() {
        const message = this.messageQueue.pop();

        if (message) {
            switch (message.constructor) {
                case TextMessage:
                    await this.bot.telegram.sendMessage(message.chatId, 
                        message.text, 
                        { reply_to_message_id: message.replyId, parse_mode: "MarkdownV2" });
                    break;
                case ImageMessage:
                    await this.bot.telegram.sendPhoto(
                        message.chatId, 
                        message.image, 
                        message.replyId ? { reply_to_message_id: message.replyId } : undefined);
                    break;
                case VideoMessage:
                    await this.bot.telegram.sendVideo(
                        message.chatId,
                        message.video, 
                        message.replyId ? { reply_to_message_id: message.replyId } : undefined);
                    break;
                default:
                    break;
            }
        }
    }

    enqueue(response) {
        this.messageQueue.push(response);
    }

    /** @param {BotMessage} botMessage  */
    usingMessage(botMessage) {
        return new MessageContext((response) => this.enqueue(response), botMessage.chat.id, botMessage.message_id, botMessage.text, botMessage.from?.id ?? undefined, botMessage.traceId);
    }

    usingChat(chatId) {
        return new ChatContext((response) => this.enqueue(response), chatId, `Trigger${chatId}`);
    }
}

module.exports = BotApiService;