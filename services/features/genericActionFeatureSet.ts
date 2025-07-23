import { ActionKey } from 'chz-telegram-bot/dist/types/action';
import { ChatId } from '../../types/chatIds';
import { test } from '../../actions/commands/test';
import { cardSearch } from '../../actions/commands/cardSearch_small';
import { replacer, reviver } from '../../helpers/mapJsonUtils';

export type BotFeatureSetsConfiguration = {
    kekruga: ChatFeatureSetConfiguration;
    botseiju: ChatFeatureSetConfiguration;
    xiao: ChatFeatureSetConfiguration;
    test: ChatFeatureSetConfiguration;
};

export type ChatFeatureSetConfiguration = Map<
    number,
    Map<ActionKey, ActionFeatureSet>
>;

export type ActionFeatureSet = {
    active: boolean;
    cooldownSeconds: number;
    extraFeatures: Map<string, boolean>;
};

export const defaultBotConfig: BotFeatureSetsConfiguration = {
    botseiju: new Map(),
    kekruga: new Map(),
    xiao: new Map(),
    test: new Map([
        [
            ChatId.TestChat,
            new Map([
                [
                    test.key,
                    {
                        active: true,
                        cooldownSeconds: 1,
                        extraFeatures: new Map<string, boolean>()
                    }
                ],
                [
                    cardSearch.key,
                    {
                        active: true,
                        cooldownSeconds: 0,
                        extraFeatures: new Map<string, boolean>()
                    }
                ]
            ])
        ]
    ])
};

const json = JSON.stringify(defaultBotConfig, replacer);
console.log(json);
console.dir(JSON.parse(json, reviver), { depth: 5 });
