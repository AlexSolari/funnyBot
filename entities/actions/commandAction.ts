import storage from '../../services/storage';
import TransactionResult from '../transactionResult';
import moment from 'moment';
import logger from '../../services/logger';
import MessageContext from '../context/messageContext';
import IActionWithState from '../../types/actionWithState';
import toArray from '../../helpers/toArray';
import IActionState from '../../types/actionState';
import CommandTriggerCheckResult from '../commandTriggerCheckResult';
import { CommandHandler } from '../../types/handlers';
import { CommandCondition } from '../../types/commandCondition';
import { Seconds } from '../../types/timeValues';
import { secondsToMilliseconds } from '../../helpers/timeConvertions';

export default class CommandAction<TActionState extends IActionState>
    implements IActionWithState
{
    triggers: (string | RegExp)[];
    handler: CommandHandler<TActionState>;
    name: string;
    cooldownInSeconds: Seconds;
    active: boolean;
    chatsBlacklist: number[];
    allowedUsers: number[];
    condition: CommandCondition<TActionState>;
    stateConstructor: () => TActionState;
    key: string;

    constructor(
        trigger: string | RegExp | Array<string> | Array<RegExp>,
        handler: CommandHandler<TActionState>,
        name: string,
        active: boolean,
        cooldown: Seconds,
        chatsBlacklist: Array<number>,
        allowedUsers: Array<number>,
        condition: CommandCondition<TActionState>,
        stateConstructor: () => TActionState
    ) {
        this.triggers = toArray(trigger);
        this.handler = handler;
        this.name = name;
        this.cooldownInSeconds = cooldown;
        this.active = active;
        this.chatsBlacklist = chatsBlacklist;
        this.allowedUsers = allowedUsers;
        this.condition = condition;
        this.stateConstructor = stateConstructor;

        this.key = `command:${this.name.replace('.', '-')}`;
    }

    async exec(ctx: MessageContext<TActionState>) {
        if (!this.active || this.chatsBlacklist.includes(ctx.chatId)) return;

        const isConditionMet = await this.condition(ctx);

        if (!isConditionMet) return;

        const state = await storage.getActionState<TActionState>(
            this,
            ctx.chatId
        );

        const { shouldTrigger, matchResults, skipCooldown } = this.triggers
            .map((x) => this.#checkTrigger(ctx, x, state))
            .reduce(
                (acc, curr) => acc.mergeWith(curr),
                CommandTriggerCheckResult.DoNotTrigger
            );

        if (!shouldTrigger) return;

        logger.logWithTraceId(
            ctx.botName,
            ctx.traceId,
            ` - Executing [${this.name}] in ${ctx.chatId}`
        );
        ctx.matchResults = matchResults;

        await this.handler(ctx, state);

        if (skipCooldown) {
            ctx.startCooldown = false;
        }

        if (ctx.startCooldown) {
            state.lastExecutedDate = moment().valueOf();
        }

        ctx.updateActions.forEach((action) => action(state));

        await storage.commitTransactionForAction(
            this,
            ctx.chatId,
            new TransactionResult(state, ctx.startCooldown && shouldTrigger)
        );
    }

    #checkTrigger(
        ctx: MessageContext<TActionState>,
        trigger: RegExp | string,
        state: IActionState
    ) {
        let shouldTrigger = false;
        const matchResults: RegExpExecArray[] = [];

        if (!ctx.fromUserId)
            return CommandTriggerCheckResult.DontTriggerAndSkipCooldown;

        const isUserAllowed =
            this.allowedUsers.length == 0 ||
            this.allowedUsers.includes(ctx.fromUserId);
        const cooldownInMilliseconds = secondsToMilliseconds(
            this.cooldownInSeconds
        );
        const notOnCooldown =
            moment().valueOf() - state.lastExecutedDate >=
            cooldownInMilliseconds;

        if (isUserAllowed && notOnCooldown) {
            if (typeof trigger == 'string') {
                shouldTrigger = ctx.messageText.toLowerCase() == trigger;
            } else {
                let matchCount = ctx.messageText.match(trigger)?.length ?? 0;
                if (matchCount > 0) {
                    for (; matchCount > 0; matchCount--) {
                        const execResult = trigger.exec(ctx.messageText);
                        if (execResult) matchResults.push(execResult);
                    }
                    shouldTrigger = true;
                }
            }
        }

        return new CommandTriggerCheckResult(
            shouldTrigger,
            matchResults,
            !isUserAllowed
        );
    }
}
