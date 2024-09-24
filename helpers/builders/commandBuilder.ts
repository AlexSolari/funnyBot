import MessageContext from "../../entities/context/messageContext";
import Command from "../../entities/actions/command";
import { ActionStateBase, IActionState } from "../../entities/states/actionStateBase";

export class CommandBuilderWithState<TActionState extends IActionState> {
    name: string;
    trigger: string | RegExp | Array<string> | Array<RegExp> = [];
    
    active = true;
    cooldownSeconds = 0;
    blacklist: number[] = [];
    allowedUsers: number[] = [];
    stateConstructor: () => IActionState = () => new ActionStateBase();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    handler: (ctx: MessageContext<TActionState>, state: TActionState) => Promise<void> = async (ctx, state) => {};
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    condition: (ctx: MessageContext<TActionState>) => Promise<boolean> = async (ctx) => true;

    constructor(name: string) {
        this.name = name;
    }

    withState(stateConstructor: () => TActionState){
        this.stateConstructor = stateConstructor;

        return this;
    }

    on(trigger: string | RegExp | Array<string> | Array<RegExp>) {
        this.trigger = trigger;

        return this;
    }

    from(id: number | Array<number>) {
        if (!Array.isArray(id)) {
            id = [id]
        }

        this.allowedUsers = id;

        return this;
    }

    do(handler: (ctx: MessageContext<TActionState>, state: TActionState) => Promise<void>) {
        this.handler = handler;

        return this;
    }

    when(condition: (arg0: MessageContext<TActionState>) => Promise<boolean>) {
        this.condition = condition;

        return this;
    }

    disabled() {
        this.active = false;

        return this;
    }

    cooldown(seconds: number) {
        this.cooldownSeconds = seconds;

        return this;
    }

    ignoreChat(chatId: number) {
        this.blacklist.push(chatId);

        return this;
    }

    build() {
        return new Command(this.trigger,
            this.handler,
            this.name,
            this.active,
            this.cooldownSeconds,
            this.blacklist,
            this.allowedUsers,
            this.condition,
            this.stateConstructor);
    }
};

export class CommandBuilder extends CommandBuilderWithState<ActionStateBase> {};