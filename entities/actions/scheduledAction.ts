import storage from '../../services/storage';
import TransactionResult from '../transactionResult';
import moment from "moment";
import logger from '../../services/logger';
import taskScheduler from '../../services/taskScheduler';
import { Sema as Semaphore } from 'async-sema';
import ChatContext from '../context/chatContext';
import IActionWithState from '../../types/actionWithState';
import ActionStateBase from '../states/actionStateBase';
import IActionState from '../../types/actionState';
import { ScheduledHandler } from '../../types/handlers';
import CachedStateFactory from '../cachedStateFactory';
import { hoursToMilliseconds } from '../../helpers/timeConvertions';
import { Hours } from '../../types/timeValues';

export default class ScheduledAction implements IActionWithState {
    static semaphore = new Semaphore(1);
    
    name: string;
    timeinHours: Hours;
    active: boolean;
    chatsWhitelist: number[];
    key: string;

    cachedState = new Map<string, unknown>();
    stateConstructor = () => new ActionStateBase();
    cachedStateFactories: Map<string, CachedStateFactory>;
    handler: ScheduledHandler;

    constructor(
        name: string, 
        handler: ScheduledHandler,
        timeinHours: Hours, 
        active: boolean, 
        whitelist: number[],
        cachedStateFactories: Map<string, CachedStateFactory>) 
    {
        this.name = name;
        this.handler = handler;
        this.timeinHours = timeinHours;
        this.active = active;
        this.chatsWhitelist = whitelist;
        this.cachedStateFactories = cachedStateFactories;
        this.key = `scheduled:${this.name.replace('.', '-')}`;
    }

    async exec(ctx: ChatContext) {
        if (!this.active || this.chatsWhitelist.indexOf(ctx.chatId) == -1)
            return;

        const state = await storage.getActionState(this, ctx.chatId);
        const isAllowedToTrigger = this.#shouldTrigger(state);

        if (isAllowedToTrigger) {
            logger.logWithTraceId(ctx.traceId, ` - Executing [${this.name}] in ${ctx.chatId}`);

            await this.handler(ctx, <TResult>(key: string) => this.#getCachedValue(key) as TResult);

            state.lastExecutedDate = moment().valueOf();

            await storage.commitTransactionForAction(this, ctx.chatId, new TransactionResult(state, isAllowedToTrigger))
        }
    }

    async #getCachedValue(key: string): Promise<unknown> {
        await ScheduledAction.semaphore.acquire();

        try {
            if (this.cachedState.has(key)) {
                return this.cachedState.get(key) ?? null;
            }

            if (this.cachedStateFactories.has(key)) {
                const cachedItemFactory = this.cachedStateFactories.get(key)!;
                const value = await cachedItemFactory.getValue();

                this.cachedState.set(key, value);
                taskScheduler.createOnetimeTask(
                    `Drop cached value [${this.name} : ${key}]`,
                    () => this.cachedState.delete(key),
                    hoursToMilliseconds(cachedItemFactory.invalidationTimeoutInHours)
                );

                return value;
            }

            return null;
        } finally {
            ScheduledAction.semaphore.release();
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