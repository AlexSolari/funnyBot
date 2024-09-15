import storage from '../../services/storage';
import TransactionResult from '../transactionResult';
import moment from "moment";
import logger from '../../services/logger';
import taskScheduler from '../../services/taskScheduler';
import { Sema as Semaphore } from 'async-sema';
import ChatContext from '../context/chatContext';
import IActionWithState from './actionWithState';
import { ActionStateBase, IActionState } from '../states/actionStateBase';

export default class Trigger implements IActionWithState {
    static semaphore = new Semaphore(1);
    name: string;
    timeinHours: number;
    active: boolean;
    chatsWhitelist: number[];
    key: string;

    cachedState = new Map<string, unknown>();
    stateConstructor = () => new ActionStateBase();
    cachedStateFactories: Map<string, { itemFactory: () => Promise<unknown>; invalidationTimeout: number; }>;
    handler: (ctx: ChatContext, getCached: ((key: string) => Promise<unknown>) | void) => Promise<void>;

    constructor(name: string, handler: (ctx: ChatContext, getCached: (key: string) => Promise<unknown>) => Promise<void>, timeinHours: number, active: boolean, whitelist: number[], cachedStateFactories: Map<string, { itemFactory: () => Promise<unknown>; invalidationTimeout: number; }>) {
        this.name = name;
        this.handler = handler;
        this.timeinHours = timeinHours;
        this.active = active;
        this.chatsWhitelist = whitelist;
        this.cachedStateFactories = cachedStateFactories;
        this.key = `trigger:${this.name.replace('.', '-')}`;
    }

    async exec(ctx: ChatContext) {
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

    async #getCachedValue(key: string): Promise<unknown> {
        await Trigger.semaphore.acquire();

        try {
            if (this.cachedState.has(key)) {
                return this.cachedState.get(key) ?? null;
            }

            if (this.cachedStateFactories.has(key)) {

                const cachedItemFactories = this.cachedStateFactories.get(key)!;
                const value = await cachedItemFactories.itemFactory();

                this.cachedState.set(key, value);
                taskScheduler.createOnetimeTask(
                    `Drop cached value [${this.name} : ${key}]`,
                    () => this.cachedState.delete(key),
                    cachedItemFactories.invalidationTimeout
                );

                return value;
            }

            return null;
        } finally {
            Trigger.semaphore.release();
        }
    }

    #shouldTrigger(state: IActionState): boolean {
        const today = moment().startOf('day').valueOf();

        const isAllowedToTrigger = moment().hour().valueOf() >= this.timeinHours;
        const hasTriggeredToday = state.lastExecutedDate >= today;

        return isAllowedToTrigger
            && !hasTriggeredToday;
    }
};