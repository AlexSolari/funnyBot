import { ActionKey, Seconds } from 'chz-telegram-bot';
import { ChatId } from './chatIds';
import { SpecificUsers } from './userIds';

export type BotFeatureSetsConfiguration = {
    default: Map<ActionKey, ActionFeatureSet>;
    kekruga: Map<ActionKey, ActionFeatureSet>;
    botseiju: Map<ActionKey, ActionFeatureSet>;
    xiao: Map<ActionKey, ActionFeatureSet>;
    test: Map<ActionKey, ActionFeatureSet>;
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
