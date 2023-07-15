const TeleBot = require('telebot');
const BotApiHelper = require('../helpers/botApi');
const chatIds = require('../helpers/chatIds');

class Bot {
    constructor() {
        this.bot = null;
        this.api = null;
        this.commands = [];
        this.triggers = [];
        this.commandQueue = [];

        this.broadcastPool = [chatIds.pioneerChat, chatIds.modernChat];
    }

    addCommand(command) {
        this.commands.push(command);
    }

    removeCommand(commandName){
        this.commands = this.commands.filter(x => x.name != commandName);
    }

    addTrigger(command) {
        this.triggers.push(command);
    }

    start(token) {
        const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

        this.bot = new TeleBot({
            token: token,
            polling: {
                interval: 50,
                limit: 10,
            }
        });
        
        this.api = new BotApiHelper(this.bot);

        this.bot.on('text', (msg) => {
            console.log(`${msg.chat.title ? msg.chat.title + " " + msg.chat.id : "DM"} | ${msg.from.first_name} (${msg.from.id}): ${msg.text}`);
            this.commandQueue.push(msg);
        });

        this.bot.start();

        setInterval(async () => {
            while (this.commandQueue.length > 0) {
                const queuedMsg = this.commandQueue.shift();
                this.dequeue(queuedMsg);
                await sleep(50);
            }
        }, 500);

        this.runTriggers();
        setInterval(() => {
            this.runTriggers();
        }, 1000 * 60 * 30); //30 minutes
    }

    runTriggers(){
        this.broadcastPool.forEach(chat => {
            this.triggers.forEach(trig => trig.exec(this.api, chat));
        });
    }

    dequeue(msg) {
        this.commands.forEach(cmd => {
            cmd.exec(msg.text, this.api, msg);
        });
    }
}

module.exports = Bot;