import { ActionKey, Seconds } from 'chz-telegram-bot';
import { ChatId } from './chatIds';
import { SpecificUsers } from './userIds';

export type BotFeatureSetsConfiguration = {
    version: number;

    default: Map<ActionKey, ActionFeatureSet>;
    chats: {
        kekruga: ChatFeatureSetsConfiguration;
        botseiju: ChatFeatureSetsConfiguration;
        xiao: ChatFeatureSetsConfiguration;
        test: ChatFeatureSetsConfiguration;
    };
};

export type ChatFeatureSetsConfiguration = {
    featureSets: Map<ActionKey, ActionFeatureSet>;
    settings: {
        fallbackBehaviour: 'disable' | 'inherit';
    };
};

export interface ActionFeatureSet {
    description: string;
    active: boolean;
    cooldownSeconds: Seconds;
    cooldownMessage: string | undefined;
    chatWhitelist: ChatId[];
    chatBlacklist: ChatId[];
    userWhitelist: SpecificUsers[];
    extraFeatures: Map<string, boolean>;
}
