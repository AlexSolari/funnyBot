import storage from '../../services/storage.js';
import measureExecutionTime from '../../services/executionTimeTracker.js';
import ChatContext from '../context/chatContext.js';
import ActionState from '../actionState.js';
import TransactionResult from '../transactionResult.js';

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
                await measureExecutionTime(this.name, async () => {
                    await this.handler(ctx);
                }, ctx.traceId);
    
                state.lastExecutedDate = new Date().getTime();
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
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);

        const isAllowedToTrigger = new Date().getHours() >= this.timeinHours;
        const hasNotTriggeredToday = state.lastExecutedDate <= yesterday.getTime();

        return isAllowedToTrigger
            && hasNotTriggeredToday;
    }
};