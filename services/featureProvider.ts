import { readFileSync, writeFileSync } from 'fs';
import {
    BotFeatureSetsConfiguration,
    defaultBotConfig
} from './features/genericActionFeatureSet';
import { replacer, reviver } from '../helpers/mapJsonUtils';

class FeatureProvider {
    config: BotFeatureSetsConfiguration;
    storagePath: string;

    constructor(path?: string) {
        this.storagePath = path ?? 'storage';
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
    }

    getFeaturesForChat(
        botName: keyof BotFeatureSetsConfiguration,
        chatId: number
    ) {
        return defaultBotConfig[botName].get(chatId)!;
    }
}

export const featureProvider = new FeatureProvider();
