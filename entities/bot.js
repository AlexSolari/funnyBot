const TeleBot = require('telebot');
const BotApiService = require('../services/botApi');
const taskScheduler = require('../services/taskScheduler');

class Bot {
    constructor(name, broadcastPool) {
        this.name = name;
        this.bot = null;
        this.api = null;
        this.commands = [];
        this.triggers = [];
        this.messageQueue = [];

        this.broadcastPool = broadcastPool;
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
        this.bot = new TeleBot({
            token: token,
            polling: {
                interval: 50,
                limit: 10,
            }
        });
        
        this.api = new BotApiService(this.bot);

        this.bot.on('text', (msg) => {
            console.log(`${msg.chat.title ? msg.chat.title + " " + msg.chat.id : "DM"} | ${msg.from?.first_name ?? "Unknown"} (${msg.from?.id ?? "Unknown"}): ${msg.text}`);
            this.messageQueue.push(msg);
        });

        this.bot.start();

        taskScheduler.createTask("MessageProcessing", () => {
            while (this.messageQueue.length > 0) {
                this.dequeue();
            }
        }, 500);

        taskScheduler.createTask("TriggerProcessing", () => {
            this.runTriggers();
        }, 1000 * 60 * 30, true); //30 minutes
    }

    runTriggers(){
        this.broadcastPool.forEach(chatId => {
            this.triggers.forEach(async (trig) => {
                try {
                    await trig.exec(this.api.usingChat(chatId));
                } catch (error) {
                    console.error(error);
                }
            });
        });
    }

    dequeue() {
        const msg = this.messageQueue.pop();

        this.commands.forEach(async (cmd) => {
            try {
                await cmd.exec(this.api.usingMessage(msg));
            } catch (error) {
                console.error(error);
            }
        });
    }
}

module.exports = Bot;