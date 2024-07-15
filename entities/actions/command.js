import storage from '../../services/storage.js';
import measureExecutionTime from '../../services/executionTimeTracker.js';
import MessageContext from '../context/messageContext.js';
import ActionState from '../actionState.js';
import TransactionResult from '../transactionResult.js';
import moment from "moment";

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
        this.trigger = Array.isArray(trigger) ? trigger : [trigger];
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

        await storage.transactionForEntity(this, ctx.chatId, async (state) => {
            let shouldTrigger = false;
            let matchResult = null;
            let skipCooldown = true;

            this.trigger.forEach(commandTrigger => {
                const validationResult = this.#checkTrigger(ctx, commandTrigger, state);
    
                shouldTrigger = shouldTrigger || validationResult.shouldTrigger;
                matchResult = matchResult || validationResult.matchResult;
                skipCooldown = skipCooldown || validationResult.skipCooldown;
            });
    
            if (shouldTrigger) {
                ctx.matchResult = matchResult;
    
                await measureExecutionTime(this.name, async () => {
                    await this.handler(ctx);
                }, ctx.traceId)

                if (skipCooldown) {
                    ctx.startCooldown = false;
                }
    
                if (ctx.startCooldown) {
                    state.lastExecutedDate = moment().valueOf();
                }
            }
                
            return new TransactionResult(state, ctx.startCooldown && shouldTrigger);
        });
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