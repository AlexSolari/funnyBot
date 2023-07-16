const { performance } = require('perf_hooks');
const storage = require('../services/storage');

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
            const check = this.checkTrigger(ctx.text, t, storedData[ctx.chatId]);
            shouldTrigger = shouldTrigger || check.shouldTrigger;
            matchResult = check.matchResult || matchResult
        });

        if (shouldTrigger){
            console.log(` - Executing [${this.name}] with arguments ${JSON.stringify(matchResult)}`);
            const t0 = performance.now();
            await this.handler(ctx);
            const t1 = performance.now();
            console.log(` - [${this.name}] took ${(t1 - t0).toFixed(3)} ms.`);

            storedData[ctx.chatId] = {
                triggerDate: new Date().setHours(0, 0, 0, 0)
            };

            storage.save(storedData, this.key);
        }
    }

    checkTrigger(message, trigger, storedData){
        let shouldTrigger = false;
        let matchResult = null;
        const lastTriggerInfo = storedData || { triggerDate: 0 };
        const cooldownMilliseconds = this.cooldown * 1000;

        if (new Date().getTime() - lastTriggerInfo.triggerDate >= cooldownMilliseconds){
            if (typeof(trigger) == "string"){
                shouldTrigger = message.toLowerCase() == trigger;
            } else{
                matchResult = trigger.exec(message);
                shouldTrigger = matchResult && matchResult.length > 0;
            }
        }

        return {shouldTrigger, matchResult};
    }
}

module.exports = Command;