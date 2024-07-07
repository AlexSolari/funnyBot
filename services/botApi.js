import MessageContext from "../entities/context/messageContext.js";
import ChatContext from "../entities/context/chatContext.js";
import ImageMessage from "../entities/replyMessages/imageMessage.js";
import TextMessage from "../entities/replyMessages/textMessage.js";
import VideoMessage from "../entities/replyMessages/videoMessage.js";
import taskScheduler from '../services/taskScheduler.js';
import { Telegraf } from "telegraf";
import BotMessage from "../entities/botMessage.js";

export default class BotApiService {
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
};