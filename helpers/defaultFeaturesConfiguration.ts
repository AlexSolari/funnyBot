import { ChatId } from '../types/chatIds';
import {
    ActionKey,
    Hours,
    hoursToSeconds,
    IAction,
    Seconds
} from 'chz-telegram-bot';
import escapeMarkdown from './escapeMarkdown';
import { SpecificUsers } from '../types/userIds';
import {
    ActionFeatureSet,
    BotFeatureSetsConfiguration
} from '../types/featureSet';
import {
    actionDescriptions,
    ActionName,
    ActionNames
} from '../types/actionNames';

async function config(
    actionName: ActionName,
    active: boolean,
    cooldownSeconds: number,
    optional?: {
        cooldownMessage?: string;
        chatWhitelist?: ChatId[];
        chatBlacklist?: ChatId[];
        userWhitelist?: SpecificUsers[];
        extraFeatures?: Map<string, boolean>;
    }
): Promise<readonly [ActionKey, ActionFeatureSet]> {
    const actionKey = (
        (await import(`../../actions/commands/${actionName}`))[
            actionName
        ] as IAction
    ).key;

    return [
        actionKey,
        {
            description: actionDescriptions[actionName],
            active,
            cooldownSeconds: cooldownSeconds as Seconds,
            cooldownMessage: optional?.cooldownMessage,
            chatWhitelist: optional?.chatWhitelist ?? [],
            chatBlacklist: optional?.chatBlacklist ?? [],
            userWhitelist: optional?.userWhitelist ?? [],
            extraFeatures: optional?.extraFeatures ?? new Map()
        }
    ];
}

export async function createDefaultBotConfig(): Promise<BotFeatureSetsConfiguration> {
    const defaultFeatures = await Promise.all([
        config(ActionNames.banner, false, 30),
        config(ActionNames.cardSearch, true, 0),
        config(ActionNames.dispute, true, hoursToSeconds(2 as Hours), {
            chatWhitelist: [ChatId.PauperChat]
        }),
        config(ActionNames.dvach, true, 1, {
            chatWhitelist: [ChatId.GenshinChat]
        }),
        config(ActionNames.fang, true, hoursToSeconds(2 as Hours), {
            chatWhitelist: [ChatId.PioneerChat]
        }),
        config(ActionNames.gptIsTrue, true, 60, {
            cooldownMessage: escapeMarkdown(
                `Наразі не можу перевірити, спробуйте пізніше.`
            )
        }),
        config(ActionNames.gpt, true, hoursToSeconds(20 as Hours), {
            chatBlacklist: [ChatId.PauperChat]
        }),
        config(ActionNames.hello, true, hoursToSeconds(2 as Hours), {
            chatBlacklist: [
                ChatId.LvivChat,
                ChatId.FrankivskChat,
                ChatId.GenshinChat
            ]
        }),
        config(ActionNames.kamaz, true, hoursToSeconds(2 as Hours), {
            chatWhitelist: [ChatId.PioneerChat]
        }),
        config(ActionNames.long, true, hoursToSeconds(20 as Hours), {
            chatBlacklist: [ChatId.PauperChat]
        }),
        config(ActionNames.lotus, true, hoursToSeconds(2 as Hours), {
            chatWhitelist: [ChatId.PioneerChat]
        }),
        config(ActionNames.nameSave, true, 0),
        config(ActionNames.pizda, true, hoursToSeconds(2 as Hours), {
            chatBlacklist: [
                ChatId.LvivChat,
                ChatId.FrankivskChat,
                ChatId.PauperChat,
                ChatId.CbgChat
            ]
        }),
        config(ActionNames.ponyav, true, hoursToSeconds(2 as Hours), {
            chatBlacklist: [ChatId.GenshinChat, ChatId.PauperChat]
        }),
        config(ActionNames.potuzhno, true, hoursToSeconds(4 as Hours), {
            chatBlacklist: [ChatId.PauperChat]
        }),
        config(ActionNames.potuzhnoStats, true, 30, {
            chatBlacklist: [ChatId.PauperChat]
        }),
        config(ActionNames.rating, true, hoursToSeconds(2 as Hours), {
            chatBlacklist: [
                ChatId.LvivChat,
                ChatId.FrankivskChat,
                ChatId.PauperChat,
                ChatId.CbgChat
            ]
        }),
        config(ActionNames.registration, true, 30, {
            chatWhitelist: [
                ChatId.StandardChat,
                ChatId.ModernChat,
                ChatId.PioneerChat
            ]
        }),
        config(ActionNames.rozklad, true, 30, {
            chatWhitelist: [ChatId.LvivChat]
        }),
        config(ActionNames.ru, false, hoursToSeconds(1 as Hours)),
        config(ActionNames.sadwhy, true, 30, {
            chatBlacklist: [ChatId.PauperChat]
        }),
        config(ActionNames.slon, true, hoursToSeconds(2 as Hours), {
            chatBlacklist: [
                ChatId.PauperChat,
                ChatId.FrankivskChat,
                ChatId.FnmChat,
                ChatId.GenshinChat
            ]
        }),
        config(ActionNames.ternopil, true, hoursToSeconds(8 as Hours), {
            chatWhitelist: [ChatId.LvivChat],
            userWhitelist: [
                SpecificUsers.pontiff,
                SpecificUsers.trigan,
                SpecificUsers.zohan
            ]
        }),
        config(ActionNames.test, false, 1),
        config(ActionNames.vitalii, true, hoursToSeconds(24 as Hours), {
            chatWhitelist: [ChatId.LvivChat],
            userWhitelist: [SpecificUsers.vitalii]
        }),
        config(ActionNames.voice, true, hoursToSeconds(1 as Hours), {
            chatWhitelist: [ChatId.FrankivskChat]
        })
    ]);

    const xiaoFeatures = await Promise.all([
        config(ActionNames.banner, true, 30),
        config(ActionNames.ru, true, hoursToSeconds(1 as Hours))
    ]);

    const testFeatures = await Promise.all([
        config(ActionNames.test, true, 1, {
            extraFeatures: new Map([['test', true]])
        })
    ]);

    return {
        default: new Map(defaultFeatures),
        botseiju: new Map([]),
        kekruga: new Map([]),
        xiao: new Map(xiaoFeatures),
        test: new Map(testFeatures)
    };
}
