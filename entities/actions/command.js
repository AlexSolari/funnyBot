import storage from '../../services/storage.js';
import measureExecutionTime from '../../services/executionTimeTracker.js';
import MessageContext from '../context/messageContext.js';
import ActionState from '../actionState.js';
import TransactionResult from '../transactionResult.js';

export default class Command {
    /**
     * @param {string | RegExp | Array<string> | Array<RegExp>} trigger 
     * @param {(ctx: MessageContext) => Promise<void>} handler 
     * @param {string} name 
     * @param {boolean} active 
     * @param {number} cooldown 
     * @param {Array<number>} chatsBlacklist 
     */
    constructor(trigger, handler, name, active, cooldown, chatsBlacklist) {
        this.trigger = Array.isArray(trigger) ? trigger : [trigger];
        this.handler = handler;
        this.name = name;
        this.cooldown = cooldown;
        this.active = active;
        this.chatsBlacklist = chatsBlacklist;

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

            this.trigger.forEach(commandTrigger => {
                const validationResult = this.#checkTrigger(ctx.messageText, commandTrigger, state);
    
                shouldTrigger = shouldTrigger || validationResult.shouldTrigger;
                matchResult = matchResult || validationResult.matchResult;
            });
    
            if (shouldTrigger) {
                ctx.matchResult = matchResult;
    
                await measureExecutionTime(this.name, async () => {
                    await this.handler(ctx);
                }, ctx.traceId)
    
                if (ctx.startCooldown) {
                    state.lastExecutedDate = new Date().getTime();
                }
            }
                
            return new TransactionResult(state, ctx.startCooldown && shouldTrigger);
        });
    }

    /**
     * @param {string} message 
     * @param {RegExp | String} trigger 
     * @param {ActionState} state 
     * @returns {{shouldTrigger: boolean, matchResult: RegExpExecArray | null}}
     */
    #checkTrigger(message, trigger, state) {
        let shouldTrigger = false;
        let matchResult = null;
        const cooldownMilliseconds = this.cooldown * 1000;

        if ((new Date().getTime() - state.lastExecutedDate) >= cooldownMilliseconds) {
            if (typeof (trigger) == "string") {
                shouldTrigger = message.toLowerCase() == trigger;
            } else {
                matchResult = trigger.exec(message);
                shouldTrigger = (matchResult && matchResult.length > 0) || false;
            }
        }

        return { shouldTrigger, matchResult };
    }
};