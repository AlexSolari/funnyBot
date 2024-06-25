const { Telegraf } = require("telegraf");
const BotApiService = require('../services/botApi');
const taskScheduler = require('../services/taskScheduler');
const BotMessage = require("./botMessage");

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

    removeCommand(commandName) {
        this.commands = this.commands.filter(x => x.name != commandName);
    }

    addTrigger(command) {
        this.triggers.push(command);
    }

    start(token) {
        this.bot = new Telegraf(token);

        this.api = new BotApiService(this.bot);

        this.bot.on('message', (ctx) => {
            const msg = new BotMessage(ctx.update.message);
            console.log(`${msg.chat.title ? msg.chat.title + " " + msg.chat.id : "DM"} | ${msg.from?.first_name ?? "Unknown"} (${msg.from?.id ?? "Unknown"}): ${msg.text}`);
            this.messageQueue.push(msg);
        });

        this.bot.launch();

        taskScheduler.createTask("MessageProcessing", async () => {
            while (this.messageQueue.length > 0) {
                await this.dequeue();
            }
        }, 500); //Half of a second

        taskScheduler.createTask("TriggerProcessing", async () => {
            this.runTriggers();
        }, 1000 * 60 * 30, true); //30 minutes
    }

    runTriggers() {
        for (let chatId of this.broadcastPool) {
            for (let trig of this.triggers) {
                try {
                    // Trigger.exec is async, but we dont need to await for result, so just fire and forget
                    trig.exec(this.api.usingChat(chatId));
                }
                catch (error) {
                    console.error(error);
                }
            }
        }
    }

    async dequeue() {
        const msg = this.messageQueue.pop();

        for (let cmd of this.commands) {
            try {
                // For commands however, we have cooldowns, so we need to wait for the command to finish running
                await cmd.exec(this.api.usingMessage(msg));
            }
            catch (error) {
                console.error(error);
            }
        }
    }
}

module.exports = Bot;