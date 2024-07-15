import Command from "../../entities/actions/command.js";
import MessageContext from "../../entities/context/messageContext.js";

export default class CommandBuilder {
    constructor(name) {
        this.name = name;
        this.trigger = null;
        this.active = true;
        this.cooldownSeconds = 0;
        this.handler = () => { };
        this.blacklist = [];
        this.allowedUsers = [];
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
     * @param {number | Array<number>} trigger 
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
     * @param {function(MessageContext): void} handler 
     * @returns {CommandBuilder}
     */
    do(handler) {
        this.handler = handler;

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
            this.allowedUsers);
    }
};