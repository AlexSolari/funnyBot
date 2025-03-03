import MessageContext from '../entities/context/messageContext';
import ChatContext from '../entities/context/chatContext';
import ImageMessage from '../entities/responses/imageMessage';
import TextMessage from '../entities/responses/textMessage';
import VideoMessage from '../entities/responses/videoMessage';
import taskScheduler from './taskScheduler';
import logger from './logger';
import { Telegraf } from 'telegraf';
import IReplyMessage from '../types/replyMessage';
import IncomingMessage from '../entities/incomingMessage';
import { Milliseconds } from '../types/timeValues';
import Reaction from '../entities/responses/reaction';
import { InputFile } from 'telegraf/types';
import { ChatId } from '../types/chatIds';

export default class BotApiService {
    botName: string;
    telegraf: Telegraf;
    messageQueue: Array<IReplyMessage<unknown> | Reaction> = [];

    constructor(botName: string, telegraf: Telegraf) {
        this.telegraf = telegraf;
        this.botName = botName;

        taskScheduler.createTask(
            'MessageSending',
            () => {
                this.dequeueResponse();
            },
            100 as Milliseconds,
            false,
            this.botName
        );
    }

    private async dequeueResponse() {
        const message = this.messageQueue.pop();

        if (!message) return;

        try {
            await this.processResponse(message);
        } catch (error) {
            logger.errorWithTraceId(
                this.botName,
                message.traceId,
                ChatId[message.chatId],
                error as string | Error,
                message
            );
        }
    }

    private async processResponse<TType>(
        response: IReplyMessage<TType> | Reaction
    ) {
        if ('emoji' in response) {
            this.telegraf.telegram.setMessageReaction(
                response.chatId,
                response.messageId,
                [
                    {
                        type: 'emoji',
                        emoji: response.emoji
                    }
                ],
                true
            );

            return;
        }

        switch (response.constructor) {
            case TextMessage:
                await this.telegraf.telegram.sendMessage(
                    response.chatId,
                    response.content as string,
                    {
                        reply_to_message_id: response.replyId,
                        parse_mode: 'MarkdownV2'
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    } as any
                );
                break;
            case ImageMessage:
                await this.telegraf.telegram.sendPhoto(
                    response.chatId,
                    response.content as InputFile,
                    response.replyId
                        ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          ({ reply_to_message_id: response.replyId } as any)
                        : undefined
                );
                break;
            case VideoMessage:
                await this.telegraf.telegram.sendVideo(
                    response.chatId,
                    response.content as InputFile,
                    response.replyId
                        ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          ({ reply_to_message_id: response.replyId } as any)
                        : undefined
                );
                break;
            default:
                logger.errorWithTraceId(
                    this.botName,
                    response.traceId,
                    ChatId[response.chatId],
                    `Unknown message type: ${response.constructor}`,
                    response
                );
                break;
        }
    }

    private enqueueResponse<TType>(response: IReplyMessage<TType>) {
        this.messageQueue.push(response);
    }

    private enqueueReaction(reaction: Reaction) {
        this.messageQueue.push(reaction);
    }

    private getInteractions() {
        return {
            react: (reaction) => this.enqueueReaction(reaction),
            respond: (response) => this.enqueueResponse(response)
        } as IBotApiInteractions;
    }

    createContextForMessage(incomingMessage: IncomingMessage) {
        const firstName = incomingMessage.from?.first_name ?? 'Unknown user';
        const lastName = incomingMessage.from?.last_name
            ? ` ${incomingMessage.from?.last_name}`
            : '';

        return new MessageContext(
            this.botName,
            this.getInteractions(),
            incomingMessage.chat.id,
            'title' in incomingMessage.chat
                ? incomingMessage.chat.title + ' ' + incomingMessage.chat.id
                : 'DM',
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
            this.getInteractions(),
            chatId,
            ChatId[chatId],
            `Scheduled:${scheduledName}:${chatId}`
        );
    }
}

export interface IBotApiInteractions {
    respond: <TType>(response: IReplyMessage<TType>) => void;
    react: (reaction: Reaction) => void;
}
