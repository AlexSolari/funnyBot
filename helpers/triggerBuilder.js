const Trigger = require("../entities/trigger");

class TriggerBuilder{
    constructor(name){
        this.name = name;
        this.active = true;
        this.time = 0;
        this.handler = () => {};
    }

    at(time){
        this.time = time;

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

    build(){
        return new Trigger(this.name, this.handler, this.time, this.active);
    }
}

module.exports = TriggerBuilder;