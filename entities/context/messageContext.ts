import { ActionStateBase, IActionState } from '../states/actionStateBase';
import ImageMessage from "../replyMessages/imageMessage";
import TextMessage from "../replyMessages/textMessage";
import VideoMessage from "../replyMessages/videoMessage";
import ChatContext from "./chatContext";
import storage from '../../services/storage';
import { resolve } from "path";
import IReplyMessage from '../replyMessages/replyMessage';

export default class MessageContext extends ChatContext {
    messageId: number;
    messageText: string;
    matchResult: RegExpMatchArray | null = null;
    fromUserId: number | undefined;
    startCooldown: boolean = true;
    updateActions: Array<(state: IActionState) => void> = [];
    fromUserName: string;

    constructor(enqueueMethod: (message: IReplyMessage) => void, chatId: number, messageId: number, messageText: string, fromUserId: number | undefined, traceId: number | string, fromUserName: string) {
        super(enqueueMethod, chatId, traceId);

        this.messageId = messageId;
        this.messageText = messageText;
        this.fromUserId = fromUserId;
        this.fromUserName = fromUserName;
    }
    
    async loadStateOf<TActionState extends IActionState>(commandName: string): Promise<TActionState>{
        return ((await storage.load(`command:${commandName.replace('.', '-')}`))[this.chatId] as TActionState) ?? new ActionStateBase();
    }

    updateState<TActionState extends IActionState>(stateUpdateAction: (state: TActionState) => void){
        this.updateActions.push(stateUpdateAction as (state: IActionState) => void);
    }

    replyWithText(text: string) {
        this.enqueue(new TextMessage(text,
            this.chatId,
            this.messageId,
            this.traceId));
    }

    replyWithImage(name: string) {
        const filePath = `./content/${name}.png`;
        this.enqueue(new ImageMessage(
            { source: resolve(filePath) },
            this.chatId,
            this.messageId,
            this.traceId))
    }

    replyWithVideo(name: string) {
        const filePath = `./content/${name}.mp4`;
        this.enqueue(new VideoMessage(
            { source: resolve(filePath) },
            this.chatId,
            this.messageId,
            this.traceId))
    }
};