import IReplyMessage from '../../types/replyMessage';

export default class TextMessage implements IReplyMessage<string> {
    content: string;
    chatId: number;
    replyId: number | undefined;
    traceId: string | number;

    constructor(
        text: string,
        chatId: number,
        replyId: number | undefined,
        traceId: string | number
    ) {
        this.content = text;
        this.chatId = chatId;
        this.replyId = replyId;
        this.traceId = traceId;
    }
}
