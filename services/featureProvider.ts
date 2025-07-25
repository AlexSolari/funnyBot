import { readFileSync, watch, writeFileSync } from 'fs';
import {
    ActionFeatureSet,
    BotFeatureSetsConfiguration,
    createDefaultBotConfig
} from './features/genericActionFeatureSet';
import { replacer, reviver } from '../helpers/mapJsonUtils';
import { ActionKey } from 'chz-telegram-bot/dist/types/action';
import { Seconds } from 'chz-telegram-bot';

class FeatureProvider {
    config!: BotFeatureSetsConfiguration;
    storagePath: string;

    constructor(path?: string) {
        this.storagePath = path ?? 'storage';
    }

    load() {
        const botConfigs = createDefaultBotConfig();
        const fileContent = readFileSync(`${this.storagePath}/features.json`, {
            encoding: 'utf-8',
            flag: 'a+'
        });

        if (!fileContent) {
            writeFileSync(
                `${this.storagePath}/features.json`,
                JSON.stringify(botConfigs, replacer),
                {
                    encoding: 'utf-8',
                    flag: 'a+'
                }
            );
        }

        this.config = fileContent
            ? JSON.parse(fileContent, reviver)
            : botConfigs;

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

    getFeaturesForAction(botName: string, key: ActionKey) {
        if (this.config == null) {
            return {
                description: '',
                active: false,
                cooldownSeconds: 0 as Seconds,
                cooldownMessage: undefined,
                chatWhitelist: [],
                chatBlacklist: [],
                userWhitelist: [],
                extraFeatures: new Map<string, boolean>()
            };
        }

        const defaultFeatures = this.config.default;
        const botFeatures =
            botName in this.config
                ? this.config[botName as keyof typeof this.config]
                : new Map<ActionKey, ActionFeatureSet>();

        const actionFeatures = botFeatures.get(key) ?? defaultFeatures.get(key);
        if (actionFeatures) return actionFeatures;

        throw new Error(
            `Missing both default and specific features configuration for ${key}, fallback failed.`
        );
    }
}

export const featureProvider = new FeatureProvider();
