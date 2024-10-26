import ImageMessage from '../replyMessages/imageMessage';
import IReplyMessage from '../../types/replyMessage';
import TextMessage from '../replyMessages/textMessage';
import VideoMessage from '../replyMessages/videoMessage';
import { resolve } from 'path';

export default class ChatContext {
    botName: string;
    enqueue: (message: IReplyMessage) => void;
    chatId: number;
    traceId: number | string;

    constructor(
        botName: string,
        enqueueMethod: (message: IReplyMessage) => void,
        chatId: number,
        traceId: number | string
    ) {
        this.botName = botName;
        this.enqueue = enqueueMethod;
        this.chatId = chatId;
        this.traceId = traceId;
    }

    sendTextToChat(text: string) {
        this.enqueue(
            new TextMessage(text, this.chatId, undefined, this.traceId)
        );
    }

    sendImageToChat(name: string) {
        const filePath = `./content/${name}.png`;
        this.enqueue(
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
        this.enqueue(
            new VideoMessage(
                { source: resolve(filePath) },
                this.chatId,
                undefined,
                this.traceId
            )
        );
    }
}
