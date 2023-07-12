const Command = require("../entities/command");

class CommandBuilder{
    constructor(name){
        this.name = name;
        this.trigger = null;
        this.active = true;
        this.cooldownSeconds = 0;
        this.condition = () => true;
        this.handler = () => {};
        this.blacklist = [];
    }

    on(trigger){
        this.trigger = trigger;

        return this;
    }

    when(condition){
        this.condition = condition;

        return this;
    }

    do(handler){
        this.handler = handler;

        return this;
    }

    disabled(){
        this.active = false;

        return this;
    }

    cooldown(seconds){
        this.cooldownSeconds = seconds;

        return this;
    }

    ignoreChat(chatId){
        this.blacklist.push(chatId);

        return this;
    }

    build(){
        return new Command(this.trigger, this.condition, this.handler, this.name, this.active, this.cooldownSeconds, this.blacklist);
    }
}

module.exports = CommandBuilder;