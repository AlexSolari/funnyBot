/** @import ChatContext from "../../entities/context/chatContext.js"; */
import Trigger from "../../entities/actions/trigger.js";

export default class TriggerBuilder {
    constructor(name) {
        this.name = name;
        this.active = true;
        this.time = 0;
        this.handler = () => { };
        this.whitelist = [];
        /** @type {Map<string, {itemFactory: () => Promise<any>, invalidationTimeout: number}>} */
        this.cachedStateFactories = new Map();
    }

    allowIn(whitelist) {
        this.whitelist = whitelist;

        return this;
    }

    at(time) {
        this.time = time;

        return this;
    }

    /**
     * @param {(ctx: ChatContext, getCached: (key: string) => Promise<any>) => Promise<void>} handler 
     * @returns {TriggerBuilder}
     */
    do(handler) {
        this.handler = handler;

        return this;
    }

    /**
     * @param {string} key
     * @param {() => Promise<any>} itemFactory 
     * @param {number} invalidationTimeout 
     */
    withSharedCache(key, itemFactory, invalidationTimeout) {
        invalidationTimeout = invalidationTimeout || 20 * 60 * 60 * 1000; //20 hours

        this.cachedStateFactories.set(key, {itemFactory, invalidationTimeout});

        return this;
    }

    disabled() {
        this.active = false;

        return this;
    }

    build() {
        return new Trigger(this.name, this.handler, this.time, this.active, this.whitelist, this.cachedStateFactories);
    }
};