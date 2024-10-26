import MessageContext from '../../entities/context/messageContext';
import CommandAction from '../../entities/actions/commandAction';
import ActionStateBase from '../../entities/states/actionStateBase';
import toArray from '../toArray';
import IActionState from '../../types/actionState';
import { CommandHandler } from '../../types/handlers';
import { CommandCondition } from '../../types/commandCondition';
import { Seconds } from '../../types/timeValues';

export class CommandActionBuilderWithState<TActionState extends IActionState> {
    name: string;
    trigger: string | RegExp | Array<string> | Array<RegExp> = [];

    active = true;
    cooldownSeconds: Seconds = 0 as Seconds;
    blacklist: number[] = [];
    allowedUsers: number[] = [];
    stateConstructor: () => TActionState;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    handler: CommandHandler<TActionState> = async (ctx, state) => {};
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    condition: CommandCondition<TActionState> = async (ctx) => true;

    constructor(name: string, stateConstructor: () => TActionState) {
        this.name = name;
        this.stateConstructor = stateConstructor;
    }

    on(trigger: string | RegExp | Array<string> | Array<RegExp>) {
        this.trigger = trigger;

        return this;
    }

    from(id: number | Array<number>) {
        this.allowedUsers = toArray(id);

        return this;
    }

    do(handler: CommandHandler<TActionState>) {
        this.handler = handler;

        return this;
    }

    when(condition: (ctx: MessageContext<TActionState>) => Promise<boolean>) {
        this.condition = condition;

        return this;
    }

    disabled() {
        this.active = false;

        return this;
    }

    cooldown(seconds: Seconds) {
        this.cooldownSeconds = seconds;

        return this;
    }

    ignoreChat(chatId: number) {
        this.blacklist.push(chatId);

        return this;
    }

    build() {
        return new CommandAction(
            this.trigger,
            this.handler,
            this.name,
            this.active,
            this.cooldownSeconds,
            this.blacklist,
            this.allowedUsers,
            this.condition,
            this.stateConstructor
        );
    }
}

export class CommandActionBuilder extends CommandActionBuilderWithState<ActionStateBase> {
    constructor(name: string) {
        super(name, () => new ActionStateBase());
    }
}
