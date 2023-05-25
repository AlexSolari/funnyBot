const {
    performance
  } = require('perf_hooks');
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

    exec(api, chatId){
        if (!this.active)
            return;

        if (this.shouldTrigger()){
            console.log(` - Executing [${this.name}]`);
            const t0 = performance.now();
            this.handler(api, chatId);
            const t1 = performance.now();
            console.log(` - [${this.name}] took ${(t1 - t0).toFixed(3)} ms.`);

            storage.save({
                triggerDate: new Date().setHours(0, 0, 0, 0)
            }, this.key);
        }
    }

    shouldTrigger(){
        const today = new Date();
        const yesterday = new Date(today);
        const lastTriggerInfo = storage.load(this.key) || { triggerDate: 0 };
        yesterday.setDate(today.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);

        const isAllowedToTrigger = new Date().getHours() >= this.timeinHours;
        const hasNotTriggeredToday = lastTriggerInfo.triggerDate <= yesterday;

        // console.log(`${today.toLocaleTimeString().split(':').slice(0, -1).join(':')} | Checking trigger conditions for [${this.name}]`);
        // console.log(` - isAllowedToTrigger = ${isAllowedToTrigger}`)
        // console.log(` - hasNotTriggeredToday =  ${hasNotTriggeredToday}`)

        return isAllowedToTrigger
            && hasNotTriggeredToday;
    }
}

module.exports = Trigger;