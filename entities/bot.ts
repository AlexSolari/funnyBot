import { Telegraf } from "telegraf";
import BotApiService from '../services/botApi';
import IncomingMessage from "./incomingMessage";
import taskScheduler from '../services/taskScheduler';
import logger from "../services/logger";
import { IActionState } from "./states/actionStateBase";
import Command from "./actions/command";
import Trigger from "./actions/trigger";
import functionality from "../functionality/functionality";

export default class Bot {
    name : string;
    api: BotApiService | null = null;
    commands: Command<IActionState>[];
    triggers: Trigger[];
    broadcastPool: number[];
    messageQueue: IncomingMessage[];

    constructor(name: string, broadcastPool: number[]) {
        this.name = name;
        this.commands = functionality.commands;
        this.triggers = functionality.triggers;
        this.broadcastPool = broadcastPool;
        this.messageQueue = [];
    }

    start(token: string) {
        const bot = new Telegraf(token);

        this.api = new BotApiService(bot);

        bot.on('message', async (ctx) => {
            const msg = new IncomingMessage(ctx.update.message);
            const messageContent = msg.text ?? '<non-text message>';

            logger.logWithTraceId(msg.traceId, `${('title' in msg.chat) ? msg.chat.title + " " + msg.chat.id : "DM"} | ${msg.from?.first_name ?? "Unknown"} (${msg.from?.id ?? "Unknown"}): ${messageContent}`);

            if (msg.text){
                this.messageQueue.push(msg);
            }
        });

        bot.launch();

        taskScheduler.createTask("MessageProcessing", async () => {
            while (this.messageQueue.length > 0) {
                await this.#processMessages();
            }
        }, 333, false);
        
        taskScheduler.createTask("TriggerProcessing", async () => {
            await this.#runTriggers();
        }, 1000 * 60 * 30, true); //30 minutes

        process.once('SIGINT', () => this.#stop(bot, 'SIGINT'));
        process.once('SIGTERM', () => this.#stop(bot, 'SIGTERM'));
    }

    #stop(bot: Telegraf, code: string){
        bot.stop(code);
        
        setTimeout(() => process.exit(0), 1000);
    }

    async #runTriggers() {
        for (const chatId of this.broadcastPool) {
            for (const trig of this.triggers) {
                const ctx = this.api!.createContextForChat(chatId, trig.name);

                try {
                    await trig.exec(ctx);
                }
                catch (error) {
                    logger.errorWithTraceId(ctx.traceId, error as (string | Error));
                }
            }
        }
    }

    async #processMessages(){
        const msg = this.messageQueue.pop()!;

        for (const cmd of this.commands) {
            const ctx = this.api!.createContextForMessage(msg);

            try {
                await cmd.exec(ctx);
            }
            catch (error) {
                logger.errorWithTraceId(ctx.traceId, error as (string | Error));
            }
        }
    }
};