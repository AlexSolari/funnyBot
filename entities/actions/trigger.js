/** @import ChatContext from '../context/chatContext.js'; */
/** @import ActionState from '../actionState.js'; */
import storage from '../../services/storage.js';
import TransactionResult from '../transactionResult.js';
import moment from "moment";
import logger from '../../services/logger.js';
import taskScheduler from '../../services/taskScheduler.js';

export default class Trigger {
    /**
     * @param {string} name 
     * @param {(ctx: ChatContext, getCached: ((key: string) => Promise<any>) | void) => Promise<void>} handler 
     * @param {number} timeinHours 
     * @param {boolean} active 
     * @param {Array<number>} whitelist 
     * @param {Map<string, {itemFactory: () => Promise<any>, invalidationTimeout: number}>} cachedStateFactories
     */
    constructor(name, handler, timeinHours, active, whitelist, cachedStateFactories) {
        this.name = name;
        this.handler = handler;
        this.timeinHours = timeinHours;
        this.active = active;
        this.chatsWhitelist = whitelist;
        this.cachedStateFactories = cachedStateFactories;

        /** @type {Map<string, any>} */
        this.cachedState = new Map();
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

            await this.handler(ctx, (key) => this.#getCachedValue(key));

            state.lastExecutedDate = moment().valueOf();

            await storage.commitTransactionForEntity(this, ctx.chatId, new TransactionResult(state, isAllowedToTrigger))
        }
    }

    /**
     * @param {string} key
     * @returns {Promise<any>}
     */
    async #getCachedValue(key) {
        if (this.cachedState.has(key)){
            return this.cachedState.get(key) ?? null;
        }

        if (this.cachedStateFactories.has(key)){
            const cachedItemPrefab = this.cachedStateFactories.get(key);
            const value = await cachedItemPrefab.itemFactory();

            this.cachedState.set(key, value);
            taskScheduler.createOnetimeTask(
                `Drop cached value [${this.name} : ${key}]`,
                () => this.cachedState.delete(key),
                cachedItemPrefab.invalidationTimeout
            );

            return value;
        }

        return null;
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