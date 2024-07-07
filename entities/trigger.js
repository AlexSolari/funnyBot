import storage from '../services/storage.js';
import measureExecutionTime from '../helpers/executionTimeTracker.js';
import ChatContext from './context/chatContext.js';

export default class Trigger {
    constructor(name, handler, timeinHours, active, whitelist) {
        this.name = name;
        this.handler = handler;
        this.timeinHours = timeinHours;
        this.active = active;
        this.chatsWhitelist = whitelist;
    }

    get key() {
        return `trigger:${this.name.replace('.', '-')}`;
    }

    /**
     * 
     * @param {ChatContext} ctx 
     * @returns 
     */
    async exec(ctx) {
        if (!this.active || this.chatsWhitelist.indexOf(ctx.chatId) == -1)
            return;

        const storedData = await storage.load(this.key) ?? {};

        if (this.shouldTrigger(storedData[ctx.chatId])) {
            await measureExecutionTime(this.name, async () => {
                await this.handler(ctx);
            }, ctx.traceId);

            storedData[ctx.chatId] = {
                triggerDate: new Date().setHours(0, 0, 0, 0)
            };

            await storage.save(storedData, this.key);
        }
    }

    shouldTrigger(storedData) {
        const today = new Date();
        const yesterday = new Date(today);
        const lastTriggerInfo = storedData ?? { triggerDate: 0 };
        yesterday.setDate(today.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);

        const isAllowedToTrigger = new Date().getHours() >= this.timeinHours;
        const hasNotTriggeredToday = lastTriggerInfo.triggerDate <= yesterday;

        return isAllowedToTrigger
            && hasNotTriggeredToday;
    }
};