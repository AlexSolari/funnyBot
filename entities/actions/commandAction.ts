import storage from '../../services/storage';
import TransactionResult from '../transactionResult';
import moment from "moment";
import logger from '../../services/logger';
import MessageContext from '../context/messageContext';
import { IActionState } from '../states/actionStateBase';
import IActionWithState from './actionWithState';

export default class CommandAction<TActionState extends IActionState> implements IActionWithState {
    triggers: (string | RegExp)[];
    handler: (ctx: MessageContext<TActionState>, state: TActionState) => Promise<void>;
    name: string;
    cooldown: number;
    active: boolean;
    chatsBlacklist: number[];
    allowedUsers: number[];
    condition: (ctx: MessageContext<TActionState>) => Promise<boolean>;
    stateConstructor: () => TActionState;
    key: string;

    constructor(
        trigger: string | RegExp | Array<string> | Array<RegExp>, 
        handler: (ctx: MessageContext<TActionState>, state: TActionState) => Promise<void>, 
        name: string, 
        active: boolean, 
        cooldown: number, 
        chatsBlacklist: Array<number>, 
        allowedUsers: Array<number>, 
        condition: (ctx: MessageContext<TActionState>) => Promise<boolean>, 
        stateConstructor: () => TActionState) 
    {
        this.triggers = Array.isArray(trigger) ? trigger : [trigger];
        this.handler = handler;
        this.name = name;
        this.cooldown = cooldown;
        this.active = active;
        this.chatsBlacklist = chatsBlacklist;
        this.allowedUsers = allowedUsers;
        this.condition = condition;
        this.stateConstructor = stateConstructor;

        this.key = `command:${this.name.replace('.', '-')}`;
    }

    async exec(ctx: MessageContext<TActionState>) {
        if (!this.active || this.chatsBlacklist.indexOf(ctx.chatId) != -1)
            return;

        const isConditionMet = await this.condition(ctx);

        if (!isConditionMet)
            return;

        const state = await storage.getActionState<TActionState>(this, ctx.chatId);

        const { shouldTrigger, matchResult, skipCooldown } =
            this.triggers
                .map(x => this.#checkTrigger(ctx, x, state))
                .reduce(
                    (acc, curr) => (
                        {
                            shouldTrigger: acc.shouldTrigger || curr.shouldTrigger,
                            matchResult: acc.matchResult || curr.matchResult,
                            skipCooldown: acc.skipCooldown || curr.skipCooldown
                        }),
                    {
                        shouldTrigger: false,
                        matchResult: null,
                        skipCooldown: false
                    }
                );

        if (!shouldTrigger)
            return;

        logger.logWithTraceId(ctx.traceId, ` - Executing [${this.name}] in ${ctx.chatId}`);
        ctx.matchResult = matchResult;

        await this.handler(ctx, state);

        if (skipCooldown) {
            ctx.startCooldown = false;
        }

        if (ctx.startCooldown) {
            state.lastExecutedDate = moment().valueOf();
        }

        ctx.updateActions.forEach(action => action(state));

        await storage.commitTransactionForEntity(
            this,
            ctx.chatId,
            new TransactionResult(state, ctx.startCooldown && shouldTrigger));
    }

    #checkTrigger(ctx: MessageContext<TActionState>, trigger: RegExp | string, state: IActionState): { shouldTrigger: boolean; matchResult: RegExpExecArray | null; skipCooldown: boolean; } {
        let shouldTrigger = false;
        let matchResult = null;

        if (!ctx.fromUserId)
            return { shouldTrigger: false, matchResult: null, skipCooldown: true };

        const isUserAllowed = this.allowedUsers.length == 0 || this.allowedUsers.includes(ctx.fromUserId);
        const cooldownMilliseconds = this.cooldown * 1000;
        const notOnCooldown = (moment().valueOf() - state.lastExecutedDate) >= cooldownMilliseconds;

        if (isUserAllowed && notOnCooldown) {
            if (typeof (trigger) == "string") {
                shouldTrigger = ctx.messageText.toLowerCase() == trigger;
            } else {
                matchResult = trigger.exec(ctx.messageText);
                shouldTrigger = (matchResult && matchResult.length > 0) || false;
            }
        }

        return { shouldTrigger, matchResult, skipCooldown: !isUserAllowed };
    }
};