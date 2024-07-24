import storage from '../../services/storage.js';
import measureExecutionTime from '../../services/executionTimeTracker.js';
import ChatContext from '../context/chatContext.js';
import ActionState from '../actionState.js';
import TransactionResult from '../transactionResult.js';
import moment from "moment";

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

        await storage.transactionForEntity(this, ctx.chatId, async (state) => {
            const isAllowedToTrigger = this.#shouldTrigger(state);

            if (isAllowedToTrigger) {
                await measureExecutionTime(`${this.name} in ${ctx.chatId}`, async () => {
                    await this.handler(ctx);
                }, ctx.traceId);
    
                state.lastExecutedDate = moment().valueOf();
            }

            return new TransactionResult(state, isAllowedToTrigger);
        });
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