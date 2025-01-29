import { Chat, User } from 'telegraf/types';
import randomInteger from '../helpers/randomInt';

export default class IncomingMessage {
    message_id: number;
    chat: Chat;
    from: User | undefined;
    text: string;
    traceId = randomInteger(10000, 99999);

    constructor(ctxMessage: {
        message_id: number;
        chat: Chat;
        from?: User;
        text?: string;
    }) {
        this.message_id = ctxMessage.message_id;
        this.chat = ctxMessage.chat;
        this.from = ctxMessage.from;
        this.text = ctxMessage.text || '';
    }
}
