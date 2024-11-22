import ActionStateBase from '../states/actionStateBase';
import ImageMessage from '../replyMessages/imageMessage';
import TextMessage from '../replyMessages/textMessage';
import VideoMessage from '../replyMessages/videoMessage';
import ChatContext from './chatContext';
import storage from '../../services/storage';
import { resolve } from 'path';
import IReplyMessage from '../../types/replyMessage';
import IActionState from '../../types/actionState';

export default class MessageContext<
    TActionState extends IActionState
> extends ChatContext {
    messageId: number;
    messageText: string;
    matchResults: RegExpMatchArray[] = [];
    fromUserId: number | undefined;
    startCooldown: boolean = true;
    updateActions: Array<(state: TActionState) => void> = [];
    fromUserName: string;

    constructor(
        botName: string,
        enqueueMethod: (message: IReplyMessage) => void,
        chatId: number,
        messageId: number,
        messageText: string,
        fromUserId: number | undefined,
        traceId: number | string,
        fromUserName: string
    ) {
        super(botName, enqueueMethod, chatId, traceId);

        this.messageId = messageId;
        this.messageText = messageText;
        this.fromUserId = fromUserId;
        this.fromUserName = fromUserName;
    }

    async loadStateOf<TAnotherActionState extends IActionState>(
        commandName: string
    ): Promise<TAnotherActionState> {
        return (
            ((await storage.load(`command:${commandName.replace('.', '-')}`))[
                this.chatId
            ] as TAnotherActionState) ?? new ActionStateBase()
        );
    }

    updateState(stateUpdateAction: (state: TActionState) => void) {
        this.updateActions.push(
            stateUpdateAction as (state: TActionState) => void
        );
    }

    replyWithText(text: string) {
        this.enqueue(
            new TextMessage(text, this.chatId, this.messageId, this.traceId)
        );
    }

    replyWithImage(name: string) {
        const filePath = `./content/${name}.png`;
        this.enqueue(
            new ImageMessage(
                { source: resolve(filePath) },
                this.chatId,
                this.messageId,
                this.traceId
            )
        );
    }

    replyWithVideo(name: string) {
        const filePath = `./content/${name}.mp4`;
        this.enqueue(
            new VideoMessage(
                { source: resolve(filePath) },
                this.chatId,
                this.messageId,
                this.traceId
            )
        );
    }
}
