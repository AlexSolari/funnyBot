const {
    performance
  } = require('perf_hooks');
  const storage = require('../services/storage');

class Command{
    constructor(trigger, condition, handler, name, active, cooldown){
        this.trigger = trigger;
        this.condition = condition;
        this.handler = handler;
        this.name = name;
        this.cooldown = cooldown;
        this.active = active;
    }

    get key(){
        return `command:${this.name.replace('.', '-')}`;
    }

    exec(message, api, botMessage){
        if (!this.active)
            return;

        let shouldTrigger = false;
        let matchResult = null;
        
        if (!Array.isArray(this.trigger)){
            this.trigger = [this.trigger];
        }

        this.trigger.forEach(t => {
            const check = this.checkTrigger(message, t);
            shouldTrigger = shouldTrigger || check.shouldTrigger;
            matchResult = check.matchResult || matchResult
        });

        if (shouldTrigger && this.condition(botMessage)){
            console.log(` - Executing [${this.name}] with arguments ${JSON.stringify(matchResult)}`);
            const t0 = performance.now();
            this.handler(api, botMessage, matchResult);
            const t1 = performance.now();
            console.log(` - [${this.name}] took ${(t1 - t0).toFixed(3)} ms.`);

            storage.save({
                triggerDate: new Date().getTime()
            }, this.key);
        }
    }

    checkTrigger(message, trigger){
        let shouldTrigger = false;
        let matchResult = null;
        const lastTriggerInfo = storage.load(this.key) || { triggerDate: 0 };
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