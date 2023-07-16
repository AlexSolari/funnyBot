const { performance } = require('perf_hooks');
const storage = require('../services/storage');

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
            console.log(` - Executing [${this.name}]`);
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