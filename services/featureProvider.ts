import { readFileSync, watch, writeFileSync } from 'fs';
import { createDefaultBotConfig } from '../helpers/defaultFeaturesConfiguration';
import { replacer, reviver } from '../helpers/mapJsonUtils';
import { ActionKey, Seconds } from 'chz-telegram-bot';
import {
    BotFeatureSetsConfiguration,
    ActionFeatureSet
} from '../types/featureSet';

class FeatureProvider {
    config!: BotFeatureSetsConfiguration;
    storagePath: string;

    constructor(path?: string) {
        this.storagePath = path ?? 'storage';
    }

    async load() {
        const filePath = `${this.storagePath}/features.json`;
        const defaultConfig = await createDefaultBotConfig();
        const fileContent = readFileSync(filePath, {
            encoding: 'utf-8',
            flag: 'a+'
        });

        if (!fileContent) {
            writeFileSync(filePath, JSON.stringify(defaultConfig, replacer), {
                encoding: 'utf-8',
                flag: 'w+'
            });
            this.config = defaultConfig;
        } else {
            this.config = JSON.parse(fileContent, reviver);

            if (this.config.version < defaultConfig.version) {
                this.config.version = defaultConfig.version;
                this.config.default = defaultConfig.default;
                writeFileSync(filePath, JSON.stringify(this.config, replacer), {
                    encoding: 'utf-8',
                    flag: 'w+'
                });
            }
        }

        watch(filePath, (eventType, _) => {
            if (eventType === 'change') {
                const fileContent = readFileSync(filePath, {
                    encoding: 'utf-8',
                    flag: 'w+'
                });

                if (fileContent) {
                    this.config = JSON.parse(fileContent, reviver);
                }
            }
        });
    }

    getFeaturesForAction(botName: string, key: ActionKey) {
        if (this.config == null) {
            throw new Error(`Config is not loaded yet.`);
        }

        const defaultFeatures = this.config.default;
        const botFeatures =
            this.config.chats[botName as keyof typeof this.config.chats];

        const fallbackFeature: ActionFeatureSet =
            botFeatures.settings.fallbackBehaviour == 'inherit'
                ? defaultFeatures.get(key)!
                : {
                      description: '',
                      active: false,
                      cooldownMessage: undefined,
                      cooldownSeconds: 0 as Seconds,
                      chatBlacklist: [],
                      chatWhitelist: [],
                      userWhitelist: [],
                      extraFeatures: new Map()
                  };

        const actionFeatures =
            botFeatures.featureSets.get(key)! ?? fallbackFeature;
        if (actionFeatures) return actionFeatures;

        throw new Error(
            `Missing both default and specific features configuration for ${key}, fallback failed.`
        );
    }
}

export const featureProvider = new FeatureProvider();
