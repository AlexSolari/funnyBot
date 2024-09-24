import Trigger from "../../entities/actions/trigger";
import ChatContext from "../../entities/context/chatContext";

export default class TriggerBuilder {
    active = true;
    time = 0;
    cachedStateFactories = new Map<string, {itemFactory: () => Promise<unknown>, invalidationTimeout: number}>();
    whitelist: number[] = [];

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    handler: (ctx: ChatContext, getCached: (key: string) => Promise<unknown>) => Promise<void> = async (ctx, getCached) => {};

    name: string;

    constructor(name: string) {
        this.name = name;
    }

    allowIn(chatId: number) {
        this.whitelist.push(chatId);

        return this;
    }

    at(time: number) {
        this.time = time;

        return this;
    }

    do(handler: (ctx: ChatContext, getCached: (key: string) => Promise<unknown>) => Promise<void>) {
        this.handler = handler;

        return this;
    }

    withSharedCache(key: string, itemFactory: () => Promise<unknown>, invalidationTimeout = 20 * 60 * 60 * 1000 ) { //20 hours
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