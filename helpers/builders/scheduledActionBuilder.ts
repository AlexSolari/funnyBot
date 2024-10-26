import ScheduledAction from '../../entities/actions/scheduledAction';
import CachedStateFactory from '../../entities/cachedStateFactory';
import { ScheduledHandler } from '../../types/handlers';
import { Hours, HoursOfDay } from '../../types/timeValues';

export default class ScheduledActionBuilder {
    active = true;
    time: HoursOfDay = 0;
    cachedStateFactories = new Map<string, CachedStateFactory>();
    whitelist: number[] = [];

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    handler: ScheduledHandler = async (ctx, getCached) => {};

    name: string;

    constructor(name: string) {
        this.name = name;
    }

    allowIn(chatId: number) {
        this.whitelist.push(chatId);

        return this;
    }

    runAt(time: HoursOfDay) {
        this.time = time;

        return this;
    }

    do(handler: ScheduledHandler) {
        this.handler = handler;

        return this;
    }

    withSharedCache(
        key: string,
        itemFactory: () => Promise<unknown>,
        invalidationTimeoutInHours: Hours = 20 as Hours
    ) {
        this.cachedStateFactories.set(
            key,
            new CachedStateFactory(itemFactory, invalidationTimeoutInHours)
        );

        return this;
    }

    disabled() {
        this.active = false;

        return this;
    }

    build() {
        return new ScheduledAction(
            this.name,
            this.handler,
            this.time,
            this.active,
            this.whitelist,
            this.cachedStateFactories
        );
    }
}
