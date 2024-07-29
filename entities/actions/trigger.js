import storage from '../../services/storage.js';
import ChatContext from '../context/chatContext.js';
import ActionState from '../actionState.js';
import TransactionResult from '../transactionResult.js';
import moment from "moment";
import logger from '../../services/logger.js';

export default class Trigger {
    /**
     * @param {string} name 
     * @param {(ctx: ChatContext) => Promise<void>} handler 
     * @param {number} timeinHours 
     * @param {boolean} active 
     * @param {Array<number>} whitelist 
     */
    constructor(name, handler, timeinHours, active, whitelist) {
        this.name = name;
        this.handler = handler;
        this.timeinHours = timeinHours;
        this.active = active;
        this.chatsWhitelist = whitelist;

        this.key = `trigger:${this.name.replace('.', '-')}`;
    }

    /**
     * 
     * @param {ChatContext} ctx 
     * @returns 
     */
    async exec(ctx) {
        if (!this.active || this.chatsWhitelist.indexOf(ctx.chatId) == -1)
            return;

        const state = await storage.getActionState(this, ctx.chatId);
        const isAllowedToTrigger = this.#shouldTrigger(state);

        if (isAllowedToTrigger) {
            logger.logWithTraceId(ctx.traceId, ` - Executing [${this.name}] in ${ctx.chatId}`);

            await this.handler(ctx);

            state.lastExecutedDate = moment().valueOf();

            await storage.commitTransactionForEntity(this, ctx.chatId, new TransactionResult(state, isAllowedToTrigger))
        }
    }

    /**
     * 
     * @param {ActionState} state 
     * @returns {boolean}
     */
    #shouldTrigger(state) {
        const today = moment().startOf('day').valueOf();

        const isAllowedToTrigger = moment().hour().valueOf() >= this.timeinHours;
        const hasTriggeredToday = state.lastExecutedDate >= today;

        return isAllowedToTrigger
            && !hasTriggeredToday;
    }
};