import { readFile } from 'fs/promises';
import Bot from './entities/bot.js';
import { ChatId } from './types/chatIds.js';
import taskScheduler from './services/taskScheduler.js';
import { setTimeout } from 'timers/promises';
import { Seconds } from './types/timeValues.js';
import { secondsToMilliseconds } from './helpers/timeConvertions.js';
import storage from './services/storage.js';
import logger from './services/logger.js';

const bots: Bot[] = [];

if (process.env.NODE_ENV == 'production') {
    startBot('kekruga', 'token.prod', [
        ChatId.ModernChat,
        ChatId.PioneerChat,
        ChatId.SpellSeeker,
        ChatId.StandardChat,
        ChatId.PauperChat
    ]);
    startBot('botseiju', 'token.lviv', [ChatId.LvivChat, ChatId.FrankivskChat]);
} else {
    startBot('test', 'token.test', [ChatId.TestChat]);
}

process.once('SIGINT', () => stopBots('SIGINT'));
process.once('SIGTERM', () => stopBots('SIGTERM'));

function log(text: string) {
    logger.logWithTraceId('ALL BOTS', 'System:Bot', text);
}

async function startBot(
    name: string,
    tokenFile: string,
    broadcastPool: number[]
) {
    const bot = new Bot(name, broadcastPool);
    const token = await readFile(tokenFile, 'utf8');

    bot.start(token);
    bots.push(bot);
}

async function stopBots(reason: string) {
    log(`Recieved termination code: ${reason}`);
    taskScheduler.stopAll();
    log('Acquiring storage semaphore...');
    await storage.semaphoreInstance.acquire();

    log('Stopping bots...');
    for (const bot of bots) {
        bot.stop(reason);
    }

    log('Shutdown in 3 seconds...');
    await setTimeout(secondsToMilliseconds(3 as Seconds));

    process.exit(0);
}
