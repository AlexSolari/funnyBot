import ImageMessage from '../responses/imageMessage';
import TextMessage from '../responses/textMessage';
import VideoMessage from '../responses/videoMessage';
import { resolve } from 'path';
import { IBotApiInteractions } from '../../services/botApi';

export default class ChatContext {
    botName: string;
    interactions: IBotApiInteractions;
    chatId: number;
    traceId: number | string;

    constructor(
        botName: string,
        interactions: IBotApiInteractions,
        chatId: number,
        traceId: number | string
    ) {
        this.botName = botName;
        this.interactions = interactions;
        this.chatId = chatId;
        this.traceId = traceId;
    }

    sendTextToChat(text: string) {
        this.interactions.respond(
            new TextMessage(text, this.chatId, undefined, this.traceId)
        );
    }

    sendImageToChat(name: string) {
        const filePath = `./content/${name}.png`;
        this.interactions.respond(
            new ImageMessage(
                { source: resolve(filePath) },
                this.chatId,
                undefined,
                this.traceId
            )
        );
    }

    sendVideoToChat(name: string) {
        const filePath = `./content/${name}.mp4`;
        this.interactions.respond(
            new VideoMessage(
                { source: resolve(filePath) },
                this.chatId,
                undefined,
                this.traceId
            )
        );
    }
}
