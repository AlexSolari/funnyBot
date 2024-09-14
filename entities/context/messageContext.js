import ActionStateBase from '../states/actionStateBase.js';
import ImageMessage from "../replyMessages/imageMessage.js";
import TextMessage from "../replyMessages/textMessage.js";
import VideoMessage from "../replyMessages/videoMessage.js";
import ChatContext from "./chatContext.js";
import storage from '../../services/storage.js';
import { resolve } from "path";

/**
 * 
 * @template {ActionStateBase} TActionState
 * @class Context used to reply to specific message that triggered a command
 * */
export default class MessageContext extends ChatContext {
    /**
     * @extends ChatContext
     * @param {(message: TextMessage | ImageMessage | VideoMessage) => void} enqueueMethod
     * @param {Number} chatId
     * @param {Number} messageId 
     * @param {Number} fromUserId 
     * @param {String} messageText 
     * @param {Number | String} traceId 
     * @param {string} fromUserName 
     */
    constructor(enqueueMethod, chatId, messageId, messageText, fromUserId, traceId, fromUserName) {
        super(enqueueMethod, chatId, traceId);

        this.messageId = messageId;
        this.messageText = messageText;
        /** @type {RegExpExecArray | null} */
        this.matchResult = null;
        this.fromUserId = fromUserId;
        this.startCooldown = true;
        /** @type {Array<(state: TActionState) => void>} */
        this.updateActions = [];
        this.fromUserName = fromUserName;
    }
    
    /**
     * @method
     * @param {string} commandName 
     * @returns {TActionState}
     */
    async loadStateOf(commandName){
        return (await storage.load(`command:${commandName.replace('.', '-')}`))[this.chatId] ?? new ActionStateBase();
    }

    /**
     * @method
     * @template {ActionStateBase} TActionState
     * @param {(state: TActionState) => void} stateUpdateAction 
     */
    updateState(stateUpdateAction){
        this.updateActions.push(stateUpdateAction);
    }

    /** 
     * @method
     * @param {String} text */
    replyWithText(text) {
        this.enqueue(new TextMessage(text,
            this.chatId,
            this.messageId,
            this.traceId));
    }

    /** 
     * @method
     * @param {String} name */
    replyWithImage(name) {
        
        const filePath = `./content/${name}.png`;
        this.enqueue(new ImageMessage(
            { source: resolve(filePath) },
            this.chatId,
            this.messageId,
            this.traceId))
    }

    /** 
     * @method
     * @param {String} name */
    replyWithVideo(name) {
        const filePath = `./content/${name}.mp4`;
        this.enqueue(new VideoMessage(
            { source: resolve(filePath) },
            this.chatId,
            this.messageId,
            this.traceId))
    }
};