import { InputFile } from "telegraf/types";
import IReplyMessage from "../../types/replyMessage";

export default class ImageMessage implements IReplyMessage {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    content: any;
    chatId: number;
    replyId: number | undefined;
    traceId: string | number;

    constructor(image: InputFile, chatId: number, replyId: number | undefined, traceId: number | string){
        this.content = image;
        this.chatId = chatId;
        this.replyId = replyId;
        this.traceId = traceId;
    }
};