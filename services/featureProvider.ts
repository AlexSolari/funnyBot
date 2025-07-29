import { watch } from 'fs';
import { createDefaultBotConfig } from '../helpers/defaultFeaturesConfiguration';
import { replacer, reviver } from '../helpers/mapJsonUtils';
import { ActionKey, Seconds } from 'chz-telegram-bot';
import {
    BotFeatureSetsConfiguration,
    ActionFeatureSet
} from '../types/featureSet';
import { writeFile, readFile } from 'fs/promises';

class FeatureProvider {
    config!: BotFeatureSetsConfiguration;
    filePath: string;
    storagePath: string;

    constructor(path?: string) {
        this.storagePath = path ?? 'storage';
        this.filePath = `${this.storagePath}/features.json`;
    }

    private async useDefaultConfig(defaultConfig: BotFeatureSetsConfiguration) {
        this.config = defaultConfig;

        await writeFile(
            this.filePath,
            JSON.stringify(defaultConfig, replacer),
            {
                encoding: 'utf-8',
                flag: 'w+'
            }
        );
    }

    private async useConfigFromFile(
        fileContent: string,
        defaultConfig: BotFeatureSetsConfiguration
    ) {
        const configFromFile = JSON.parse(fileContent, reviver);

        if (configFromFile.version < defaultConfig.version) {
            configFromFile.version = defaultConfig.version;
            configFromFile.default = defaultConfig.default;

            await writeFile(
                this.filePath,
                JSON.stringify(configFromFile, replacer),
                {
                    encoding: 'utf-8',
                    flag: 'w+'
                }
            );
        }

        this.config = configFromFile;
    }

    async load() {
        const defaultConfig = await createDefaultBotConfig();
        const fileContent = await readFile(this.filePath, {
            encoding: 'utf-8',
            flag: 'a+'
        });

        if (!fileContent) {
            await this.useDefaultConfig(defaultConfig);
        } else {
            await this.useConfigFromFile(fileContent, defaultConfig);
        }

        watch(this.filePath, async (eventType, _) => {
            if (eventType === 'change') {
                const fileContent = await readFile(this.filePath, {
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

        if (botName in this.config.chats) {
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

            return botFeatures.featureSets.get(key)! ?? fallbackFeature;
        }

        return defaultFeatures.get(key);
    }
}

export const featureProvider = new FeatureProvider();
