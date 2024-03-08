const storage = require('../services/storage');
const measureExecutionTime = require('../helpers/executionTimeTracker');
const MessageContext = require('./context/messageContext');

class Command{
    constructor(trigger, handler, name, active, cooldown, chatsBlacklist){
        this.trigger = trigger;
        this.handler = handler;
        this.name = name;
        this.cooldown = cooldown;
        this.active = active;
        this.chatsBlacklist = chatsBlacklist;
    }

    get key(){
        return `command:${this.name.replace('.', '-')}`;
    }

    /**
     * 
     * @param {MessageContext} ctx 
     * @returns 
     */
    async exec(ctx){
        if (!this.active || this.chatsBlacklist.indexOf(ctx.chatId) != -1)
            return;

        const storedData = storage.load(this.key) || {};
        let shouldTrigger = false;
        let matchResult = null;
        
        if (!Array.isArray(this.trigger)){
            this.trigger = [this.trigger];
        }

        this.trigger.forEach(t => {
            const validationResult = this.checkTrigger(ctx.messageText, t, storedData[ctx.chatId]);

            shouldTrigger = shouldTrigger || validationResult.shouldTrigger;
            matchResult = matchResult || validationResult.matchResult;
        });

        if (shouldTrigger){
            ctx.matchResult = matchResult;

            await measureExecutionTime(this.name, async () => {
                await this.handler(ctx);                
            })

            storedData[ctx.chatId] = {
                triggerDate: new Date().getTime()
            };

            storage.save(storedData, this.key);
        }
    }

    /**
     * @param {string} message 
     * @param {RegExp | String} trigger 
     * @param {any} storedData 
     * @returns {{shouldTrigger: boolean, matchResult: RegExpExecArray | null}}
     */
    checkTrigger(message, trigger, storedData){
        let shouldTrigger = false;
        let matchResult = null;
        const lastTriggerInfo = storedData || { triggerDate: 0 };
        const cooldownMilliseconds = this.cooldown * 1000;
        
        if ((new Date().getTime() - lastTriggerInfo.triggerDate) >= cooldownMilliseconds){
            if (typeof(trigger) == "string"){
                shouldTrigger = message.toLowerCase() == trigger;
            } else{
                matchResult = trigger.exec(message);
                shouldTrigger = matchResult && matchResult.length > 0;
            }
        }

        return { shouldTrigger, matchResult };
    }
}

module.exports = Command;