import { InputFile } from 'telegraf/types';
import IReplyMessage from '../../types/replyMessage';

export default class VideoMessage implements IReplyMessage<InputFile> {
    content: InputFile;
    chatId: number;
    replyId: number | undefined;
    traceId: string | number;

    constructor(
        video: InputFile,
        chatId: number,
        replyId: number | undefined,
        traceId: number | string
    ) {
        this.content = video;
        this.chatId = chatId;
        this.replyId = replyId;
        this.traceId = traceId;
    }
}
