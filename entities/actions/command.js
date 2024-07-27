import storage from '../../services/storage.js';
import MessageContext from '../context/messageContext.js';
import ActionState from '../actionState.js';
import TransactionResult from '../transactionResult.js';
import moment from "moment";
import logger from '../../services/logger.js';

export default class Command {
    /**
     * @param {string | RegExp | Array<string> | Array<RegExp>} trigger 
     * @param {(ctx: MessageContext) => Promise<void>} handler 
     * @param {string} name 
     * @param {boolean} active 
     * @param {number} cooldown 
     * @param {Array<number>} chatsBlacklist 
     * @param {Array<number>} allowedUsers 
     */
    constructor(trigger, handler, name, active, cooldown, chatsBlacklist, allowedUsers) {
        this.triggers = Array.isArray(trigger) ? trigger : [trigger];
        this.handler = handler;
        this.name = name;
        this.cooldown = cooldown;
        this.active = active;
        this.chatsBlacklist = chatsBlacklist;
        this.allowedUsers = allowedUsers;

        this.key = `command:${this.name.replace('.', '-')}`;
    }

    /**
     * 
     * @param {MessageContext} ctx 
     * @returns 
     */
    async exec(ctx) {
        if (!this.active || this.chatsBlacklist.indexOf(ctx.chatId) != -1)
            return;

        const state = await storage.beginTransactionForEntity(this, ctx.chatId);

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


        if (shouldTrigger) {
            logger.logWithTraceId(ctx.traceId, ` - Executing [${this.name}] in ${ctx.chatId}`);
            ctx.matchResult = matchResult;

            await this.handler(ctx);

            if (skipCooldown) {
                ctx.startCooldown = false;
            }

            if (ctx.startCooldown) {
                state.lastExecutedDate = moment().valueOf();
            }

            await storage.commitTransactionForEntity(
                this, 
                ctx.chatId, 
                new TransactionResult(state, ctx.startCooldown && shouldTrigger));
        }
    }

    /**
     * @param {MessageContext} ctx 
     * @param {RegExp | String} trigger 
     * @param {ActionState} state 
     * @returns {{shouldTrigger: boolean, matchResult: RegExpExecArray | null, skipCooldown: boolean}}
     */
    #checkTrigger(ctx, trigger, state) {
        let shouldTrigger = false;
        let matchResult = null;

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