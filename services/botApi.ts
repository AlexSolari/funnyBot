import MessageContext from "../entities/context/messageContext";
import ChatContext from "../entities/context/chatContext";
import ImageMessage from "../entities/replyMessages/imageMessage";
import TextMessage from "../entities/replyMessages/textMessage";
import VideoMessage from "../entities/replyMessages/videoMessage";
import taskScheduler from './taskScheduler';
import logger from "./logger";
import { Telegraf } from "telegraf";
import IReplyMessage from "../types/replyMessage";
import IncomingMessage from "../entities/incomingMessage";
import { Milliseconds } from "../types/timeValues";

export default class BotApiService {
    botName: string;
    telegraf: Telegraf;
    messageQueue: Array<IReplyMessage> = [];

    constructor(botName: string, telegraf: Telegraf) {
        this.telegraf = telegraf;
        this.botName = botName;

        taskScheduler.createTask("MessageSending", () => {
            this.#dequeueResponse();
        }, 100 as Milliseconds, false);
    }

    async #dequeueResponse() {
        const message = this.messageQueue.pop();

        if (message == undefined)
            return;

        try {
            await this.#processResponse(message);
        }
        catch (error) {
            logger.errorWithTraceId(this.botName, message.traceId, error as (string | Error));
        }
    }

    async #processResponse(message: IReplyMessage) {
        switch (message.constructor) {
            case TextMessage:
                await this.telegraf.telegram.sendMessage(message.chatId,
                    message.content,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    { reply_to_message_id: message.replyId, parse_mode: "MarkdownV2" } as any
                );
                break;
            case ImageMessage:
                await this.telegraf.telegram.sendPhoto(
                    message.chatId,
                    message.content,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    message.replyId ? { reply_to_message_id: message.replyId } as any : undefined
                );
                break;
            case VideoMessage:
                await this.telegraf.telegram.sendVideo(
                    message.chatId,
                    message.content,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    message.replyId ? { reply_to_message_id: message.replyId } as any : undefined
                );
                break;
            default:
                logger.errorWithTraceId(this.botName, message.traceId, `Unknown message type: ${message.constructor}`);
                break;
        }
    }

    #enqueueResponse(response : IReplyMessage) {
        this.messageQueue.push(response);
    }

    createContextForMessage(incomingMessage: IncomingMessage) {
        const firstName = incomingMessage.from?.first_name ?? 'Unknown user';
        const lastName = (incomingMessage.from?.last_name) ? ` ${incomingMessage.from?.last_name}` : '';

        return new MessageContext(
            this.botName,
            (response) => this.#enqueueResponse(response),
            incomingMessage.chat.id,
            incomingMessage.message_id,
            incomingMessage.text,
            incomingMessage.from?.id,
            incomingMessage.traceId,
            firstName + lastName 
        );
    }

    createContextForChat(chatId: number, scheduledName: string) {
        return new ChatContext(
            this.botName,
            (response) => this.#enqueueResponse(response),
            chatId,
            `Scheduled:${scheduledName}:${chatId}`);
    }
};