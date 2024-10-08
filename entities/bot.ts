import { Telegraf } from "telegraf";
import BotApiService from '../services/botApi';
import IncomingMessage from "./incomingMessage";
import taskScheduler from '../services/taskScheduler';
import logger from "../services/logger";
import CommandAction from "./actions/commandAction";
import ScheduledAction from "./actions/scheduledAction";
import functionality from "../functionality/functionality";
import IActionState from "../types/actionState";
import { hoursToMilliseconds, secondsToMilliseconds } from "../helpers/timeConvertions";
import { Hours, Seconds } from "../types/timeValues";

export default class Bot {
    name: string;
    api: BotApiService | null = null;
    telegraf: Telegraf | null = null;
    commands: CommandAction<IActionState>[];
    scheduled: ScheduledAction[];
    broadcastPool: number[];
    messageQueue: IncomingMessage[];

    constructor(name: string, broadcastPool: number[]) {
        this.name = name;
        this.commands = functionality.commands;
        this.scheduled = functionality.scheduled;
        this.broadcastPool = broadcastPool;
        this.messageQueue = [];
    }

    start(token: string) {
        logger.logWithTraceId(this.name, 'System:Bot', 'Starting bot...');
        this.telegraf = new Telegraf(token);

        this.api = new BotApiService(this.name, this.telegraf);

        this.telegraf.on('message', async (ctx) => {
            const msg = new IncomingMessage(ctx.update.message);
            const messageContent = msg.text ?? '<non-text message>';

            logger.logWithTraceId(
                this.name, 
                msg.traceId, 
                `${('title' in msg.chat) ? msg.chat.title + " " + msg.chat.id : "DM"} | ${msg.from?.first_name ?? "Unknown"} (${msg.from?.id ?? "Unknown"}): ${messageContent}`
            );

            if (msg.text) {
                this.messageQueue.push(msg);
            }
        });

        this.telegraf.launch();

        taskScheduler.createTask("MessageProcessing", async () => {
            while (this.messageQueue.length > 0) {
                await this.#processMessages();
            }
        }, secondsToMilliseconds(0.3 as Seconds), false, this.name);

        taskScheduler.createTask("ScheduledProcessing", async () => {
            await this.#runScheduled();
        }, hoursToMilliseconds(0.5 as Hours), true, this.name);
    }

    stop(code: string) {
        logger.logWithTraceId(this.name, 'System:Bot', 'Stopping bot...');

        this.telegraf!.stop(code);
    }

    async #runScheduled() {
        for (const chatId of this.broadcastPool) {
            for (const trig of this.scheduled) {
                const ctx = this.api!.createContextForChat(chatId, trig.name);

                try {
                    await trig.exec(ctx);
                }
                catch (error) {
                    logger.errorWithTraceId(ctx.botName, ctx.traceId, error as (string | Error));
                }
            }
        }
    }

    async #processMessages() {
        const msg = this.messageQueue.pop()!;

        for (const cmd of this.commands) {
            const ctx = this.api!.createContextForMessage(msg);

            try {
                await cmd.exec(ctx);
            }
            catch (error) {
                logger.errorWithTraceId(ctx.botName, ctx.traceId, error as (string | Error));
            }
        }
    }
};