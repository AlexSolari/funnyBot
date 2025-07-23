import { readFileSync, watch, writeFileSync } from 'fs';
import {
    BotFeatureSetsConfiguration,
    createDefaultBotConfig
} from './features/genericActionFeatureSet';
import { replacer, reviver } from '../helpers/mapJsonUtils';
import { ActionKey } from 'chz-telegram-bot/dist/types/action';

class FeatureProvider {
    config?: BotFeatureSetsConfiguration;
    storagePath: string;

    constructor(path?: string) {
        this.storagePath = path ?? 'storage';

        watch(`${this.storagePath}/features.json`, (eventType, _) => {
            if (eventType === 'change') {
                const fileContent = readFileSync(
                    `${this.storagePath}/features.json`,
                    {
                        encoding: 'utf-8',
                        flag: 'a+'
                    }
                );

                if (fileContent) {
                    this.config = JSON.parse(fileContent, reviver);
                }
            }
        });
    }

    get defaultConfig() {
        if (this.config) return this.config;

        const defaultBotConfig = createDefaultBotConfig();
        const fileContent = readFileSync(`${this.storagePath}/features.json`, {
            encoding: 'utf-8',
            flag: 'a+'
        });

        if (!fileContent) {
            writeFileSync(
                `${this.storagePath}/features.json`,
                JSON.stringify(defaultBotConfig, replacer),
                {
                    encoding: 'utf-8',
                    flag: 'a+'
                }
            );
        }

        this.config = fileContent
            ? JSON.parse(fileContent, reviver)
            : defaultBotConfig;

        return this.config as BotFeatureSetsConfiguration;
    }

    getFeaturesForAction(
        botName: keyof BotFeatureSetsConfiguration,
        chatId: number,
        key: ActionKey
    ) {
        return this.defaultConfig[botName].get(chatId)!.get(key)!;
    }
}

export const featureProvider = new FeatureProvider();
