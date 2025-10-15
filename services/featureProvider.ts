import { createDefaultBotConfig } from '../helpers/defaultFeaturesConfiguration';
import { replacer, reviver } from '../helpers/mapJsonUtils';
import { ActionKey, Seconds, secondsToMilliseconds } from 'chz-telegram-bot';
import {
    BotFeatureSetsConfiguration,
    ActionFeatureSet
} from '../types/featureSet';
import { writeFile, readFile, stat } from 'fs/promises';

class FeatureProvider {
    private readonly filePath: string;
    private readonly storagePath: string;
    private config!: BotFeatureSetsConfiguration;
    private lastModifiedDate!: Date;

    private readonly disabledFeature: ActionFeatureSet = {
        description: '',
        active: false,
        cooldownMessage: undefined,
        cooldownSeconds: 0 as Seconds,
        chatBlacklist: [],
        chatWhitelist: [],
        userWhitelist: [],
        extraFeatures: new Map()
    };

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

        if (fileContent) {
            await this.useConfigFromFile(fileContent, defaultConfig);
        } else {
            await this.useDefaultConfig(defaultConfig);
        }

        this.lastModifiedDate = new Date();

        setInterval(async () => {
            const stats = await stat(this.filePath);

            if (stats.mtime > this.lastModifiedDate) {
                this.lastModifiedDate = stats.mtime;

                const fileContent = await readFile(this.filePath, {
                    encoding: 'utf-8',
                    flag: 'w+'
                });

                if (fileContent) {
                    this.config = JSON.parse(fileContent, reviver);
                }
            }
        }, secondsToMilliseconds((5 * 60) as Seconds));
    }

    getFeaturesForAction(botName: string, key: ActionKey) {
        if (this.config == null) {
            throw new Error(`Config is not loaded yet.`);
        }

        const defaultFeatures = this.config.default;

        if (botName in this.config.chats) {
            const botFeatures =
                this.config.chats[botName as keyof typeof this.config.chats];

            const fallbackFeature =
                botFeatures.settings.fallbackBehaviour == 'inherit'
                    ? defaultFeatures.get(key)!
                    : this.disabledFeature;

            return botFeatures.featureSets.get(key)! ?? fallbackFeature;
        }

        return defaultFeatures.get(key) ?? this.disabledFeature;
    }
}

export const featureProvider = new FeatureProvider();
