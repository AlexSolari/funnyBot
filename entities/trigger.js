const storage = require('../services/storage');
const measureExecutionTime = require('../helpers/executionTimeTracker');

class Trigger{
    constructor(name, handler, timeinHours, active){
        this.name = name;
        this.handler = handler;
        this.timeinHours = timeinHours;
        this.active = active;
    }

    get key(){
        return `trigger:${this.name.replace('.', '-')}`;
    }

    async exec(ctx){
        if (!this.active)
            return;

        const storedData = storage.load(this.key) || {};

        if (this.shouldTrigger(storedData[ctx.chatId])){
            measureExecutionTime(this.name, async () => {
                await this.handler(ctx);
            });
            
            storedData[ctx.chatId] = {
                triggerDate: new Date().setHours(0, 0, 0, 0)
            };

            storage.save(storedData, this.key);
        }
    }

    shouldTrigger(storedData){
        const today = new Date();
        const yesterday = new Date(today);
        const lastTriggerInfo = storedData || { triggerDate: 0 };
        yesterday.setDate(today.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);

        const isAllowedToTrigger = new Date().getHours() >= this.timeinHours;
        const hasNotTriggeredToday = lastTriggerInfo.triggerDate <= yesterday;

        return isAllowedToTrigger
            && hasNotTriggeredToday;
    }
}

module.exports = Trigger;