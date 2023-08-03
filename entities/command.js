const storage = require('../services/storage');
const measureExecutionTime = require('../helpers/executionTimeTracker');

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
        
        if (!Array.isArray(this.trigger)){
            this.trigger = [this.trigger];
        }

        this.trigger.forEach(t => {
            shouldTrigger = shouldTrigger || this.checkTrigger(ctx.text, t, storedData[ctx.chatId]);
        });

        if (shouldTrigger){
            measureExecutionTime(this.name, async () => {
                await this.handler(ctx);                
            })

            storedData[ctx.chatId] = {
                triggerDate: new Date().getTime()
            };

            storage.save(storedData, this.key);
        }
    }

    checkTrigger(message, trigger, storedData){
        let shouldTrigger = false;
        const lastTriggerInfo = storedData || { triggerDate: 0 };
        const cooldownMilliseconds = this.cooldown * 1000;

        if ((new Date().getTime() - lastTriggerInfo.triggerDate) >= cooldownMilliseconds){
            if (typeof(trigger) == "string"){
                shouldTrigger = message.toLowerCase() == trigger;
            } else{
                let matchResult = trigger.exec(message);
                shouldTrigger = matchResult && matchResult.length > 0;
            }
        }

        return shouldTrigger;
    }
}

module.exports = Command;