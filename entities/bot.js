import { Telegraf } from "telegraf";
import BotApiService from '../services/botApi.js';
import IncomingMessage from "./incomingMessage.js";
import taskScheduler from '../services/taskScheduler.js';
import functionality from '../functionality/functionality.js';
import logger from "../services/logger.js";

export default class Bot {
    constructor(name, broadcastPool) {
        this.name = name;
        this.api = null;
        this.commands = functionality.commands;
        this.triggers = functionality.triggers;
        this.broadcastPool = broadcastPool;
        /** @type {Array<IncomingMessage>} */
        this.messageQueue = [];
    }

    start(token) {
        const bot = new Telegraf(token);

        this.api = new BotApiService(bot);

        bot.on('message', async (ctx) => {
            const msg = new IncomingMessage(ctx.update.message);
            const messageContent = msg.text 
                ?? (ctx.update.message.photo ? '🖼️' : null)
                ?? (ctx.update.message.document?.mime_type == "video/mp4" ? '🎞️' : null)
                ?? ctx.update.message.document?.mime_type
                ?? 'unknown content (probably sticker)';

            logger.logWithTraceId(msg.traceId, `${msg.chat.title ? msg.chat.title + " " + msg.chat.id : "DM"} | ${msg.from?.first_name ?? "Unknown"} (${msg.from?.id ?? "Unknown"}): ${messageContent}`);

            if (msg.text){
                this.messageQueue.push(msg);
            }
        });

        bot.launch();

        taskScheduler.createTask("MessageProcessing", async () => {
            while (this.messageQueue.length > 0) {
                await this.#processMessages();
            }
        }, 333);
        
        taskScheduler.createTask("TriggerProcessing", async () => {
            await this.#runTriggers();
        }, 1000 * 60 * 30, true); //30 minutes
    }

    async #runTriggers() {
        for (let chatId of this.broadcastPool) {
            for (let trig of this.triggers) {
                const ctx = this.api.createContextForChat(chatId, trig.name);

                try {
                    await trig.exec(ctx);
                }
                catch (error) {
                    logger.errorWithTraceId(ctx.traceId);
                }
            }
        }
    }

    async #processMessages(){
        const msg = this.messageQueue.pop();

        for (let cmd of this.commands) {
            const ctx = this.api.createContextForMessage(msg);

            try {
                await cmd.exec(ctx);
            }
            catch (error) {
                logger.errorWithTraceId(ctx.traceId, error);
            }
        }
    }
};