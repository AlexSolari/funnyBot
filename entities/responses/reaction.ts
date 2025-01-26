import { TelegramEmoji } from 'telegraf/types';

export default class Reaction {
    chatId: number;
    messageId: number;
    traceId: number | string;
    emoji: TelegramEmoji;

    constructor(
        traceId: number | string,
        chatId: number,
        messageId: number,
        emoji: TelegramEmoji
    ) {
        this.chatId = chatId;
        this.messageId = messageId;
        this.emoji = emoji;
        this.traceId = traceId;
    }
}
