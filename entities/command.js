const { performance } = require('perf_hooks');
const storage = require('../services/storage');

class Command{
    constructor(trigger, condition, handler, name, active, cooldown, chatsBlacklist){
        this.trigger = trigger;
        this.condition = condition;
        this.handler = handler;
        this.name = name;
        this.cooldown = cooldown;
        this.active = active;
        this.chatsBlacklist = chatsBlacklist;
    }

    get key(){
        return `command:${this.name.replace('.', '-')}`;
    }

    async exec(message, api, botMessage){
        if (!this.active || this.chatsBlacklist.indexOf(botMessage.chat.id) != -1)
            return;

        const storedData = storage.load(this.key) || {};
        let shouldTrigger = false;
        let matchResult = null;
        
        if (!Array.isArray(this.trigger)){
            this.trigger = [this.trigger];
        }

        this.trigger.forEach(t => {
            const check = this.checkTrigger(message, t, storedData[botMessage.chat.id]);
            shouldTrigger = shouldTrigger || check.shouldTrigger;
            matchResult = check.matchResult || matchResult
        });

        if (shouldTrigger && this.condition(botMessage)){
            console.log(` - Executing [${this.name}] with arguments ${JSON.stringify(matchResult)}`);
            const t0 = performance.now();
            await this.handler(api, botMessage, matchResult);
            const t1 = performance.now();
            console.log(` - [${this.name}] took ${(t1 - t0).toFixed(3)} ms.`);

            storedData[botMessage.chat.id] = {
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