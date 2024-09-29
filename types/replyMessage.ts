export default interface IReplyMessage {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    content: any;
    chatId: number;
    replyId: number | undefined;
    traceId: number | string;
};