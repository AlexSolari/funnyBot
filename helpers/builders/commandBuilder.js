/** @import MessageContext from "../../entities/context/messageContext.js"; */
import Command from "../../entities/actions/command.js";
import ActionStateBase from "../../entities/states/actionStateBase.js";

/**
 * @template {ActionStateBase} TActionState
 */
export default class CommandBuilder {
    /**
     * @constructor
     * @param {string} name 
     */
    constructor(name) {
        this.name = name;
        this.trigger = null;
        this.active = true;
        this.cooldownSeconds = 0;
        this.handler = () => { };
        this.stateConstructor = ActionStateBase;
        this.condition = () => true;
        this.blacklist = [];
        this.allowedUsers = [];
    }

    /**
     * @param {() => TActionState} stateConstructor 
     * @returns 
     */
    withState(stateConstructor){
        this.stateConstructor = stateConstructor;

        return this;
    }

    /**
     * @param {string | RegExp} trigger 
     * @returns {CommandBuilder}
     */
    on(trigger) {
        this.trigger = trigger;

        return this;
    }

    /**
     * @param {number | Array<number>} id 
     * @returns {CommandBuilder}
     */
    from(id) {
        if (!Array.isArray(id)) {
            id = [id]
        }

        this.allowedUsers = id;

        return this;
    }

    /**
     * @param {(ctx: MessageContext<TActionState>, state: TActionState) => Promise} handler 
     * @returns {CommandBuilder}
     */
    do(handler) {
        this.handler = handler;

        return this;
    }

    /**
     * @param {function(MessageContext): Promise<boolean>} condition 
     * @returns {CommandBuilder}
     */
    when(condition) {
        this.condition = condition;

        return this;
    }

    disabled() {
        this.active = false;

        return this;
    }

    cooldown(seconds) {
        this.cooldownSeconds = seconds;

        return this;
    }

    ignoreChat(chatId) {
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