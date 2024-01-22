const ChatContext = require("../entities/context/chatContext");
const Trigger = require("../entities/trigger");

class TriggerBuilder{
    constructor(name){
        this.name = name;
        this.active = true;
        this.time = 0;
        this.handler = () => {};
        this.whitelist = [];
    }

    allowIn(whitelist){
        this.whitelist = whitelist;

        return this;
    }

    at(time){
        this.time = time;

        return this;
    }

    /**
     * @param {function(ChatContext)} handler 
     * @returns {TriggerBuilder}
     */
    do(handler){
        this.handler = handler;

        return this;
    }

    disabled(){
        this.active = false;

        return this;
    }

    build(){
        return new Trigger(this.name, this.handler, this.time, this.active, this.whitelist);
    }
}

module.exports = TriggerBuilder;