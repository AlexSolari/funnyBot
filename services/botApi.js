import MessageContext from "../entities/context/messageContext.js";
import ChatContext from "../entities/context/chatContext.js";
import ImageMessage from "../entities/replyMessages/imageMessage.js";
import TextMessage from "../entities/replyMessages/textMessage.js";
import VideoMessage from "../entities/replyMessages/videoMessage.js";
import taskScheduler from '../services/taskScheduler.js';
import { Telegraf } from "telegraf";
import IncomingMessage from "../entities/incomingMessage.js";
import logger from "./logger.js";

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
            this.#dequeueResponse();
        }, 100);
    }

    async #dequeueResponse() {
        const message = this.messageQueue.pop();

        try {
            await this.#processResponse(message);
        }
        catch (error) {
            logger.errorWithTraceId(message.traceId, error);
        }
    }

    async #processResponse(message) {
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

    #enqueueResponse(response) {
        this.messageQueue.push(response);
    }

    /** @param {IncomingMessage} incomingMessage  */
    usingMessage(incomingMessage) {
        return new MessageContext(
            (response) => this.#enqueueResponse(response),
            incomingMessage.chat.id,
            incomingMessage.message_id,
            incomingMessage.text,
            incomingMessage.from?.id ?? undefined,
            incomingMessage.traceId);
    }

    usingChat(chatId, triggerName) {
        return new ChatContext(
            (response) => this.#enqueueResponse(response),
            chatId,
            `Trigger:${triggerName}:${chatId}`);
    }
};