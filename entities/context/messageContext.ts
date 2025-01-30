import ActionStateBase from '../states/actionStateBase';
import ImageMessage from '../responses/imageMessage';
import TextMessage from '../responses/textMessage';
import VideoMessage from '../responses/videoMessage';
import ChatContext from './chatContext';
import storage from '../../services/storage';
import { resolve } from 'path';
import IActionState from '../../types/actionState';
import { IBotApiInteractions } from '../../services/botApi';
import { TelegramEmoji } from 'telegraf/types';
import Reaction from '../responses/reaction';

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
        interactions: IBotApiInteractions,
        chatId: number,
        chatName: string,
        messageId: number,
        messageText: string,
        fromUserId: number | undefined,
        traceId: number | string,
        fromUserName: string
    ) {
        super(botName, interactions, chatId, chatName, traceId);

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
        this.interactions.respond(
            new TextMessage(text, this.chatId, this.messageId, this.traceId)
        );
    }

    replyWithImage(name: string) {
        const filePath = `./content/${name}.png`;
        this.interactions.respond(
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
        this.interactions.respond(
            new VideoMessage(
                { source: resolve(filePath) },
                this.chatId,
                this.messageId,
                this.traceId
            )
        );
    }

    react(emoji: TelegramEmoji) {
        this.interactions.react(
            new Reaction(this.traceId, this.chatId, this.messageId, emoji)
        );
    }
}
