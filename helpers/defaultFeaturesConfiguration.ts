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

const ActionNames = {
    banner: 'banner',
    cardSearch: 'cardSearch',
    dispute: 'dispute',
    dvach: 'dvach',
    fang: 'fang',
    gptIsTrue: 'gptIsTrue',
    gpt: 'gpt',
    hello: 'hello',
    kamaz: 'kamaz',
    long: 'long',
    lotus: 'lotus',
    nameSave: 'nameSave',
    pizda: 'pizda',
    ponyav: 'ponyav',
    potuzhno: 'potuzhno',
    potuzhnoStats: 'potuzhnoStats',
    rating: 'rating',
    registration: 'registration',
    rozklad: 'rozklad',
    ru: 'ru',
    sadwhy: 'sadwhy',
    slon: 'slon',
    ternopil: 'ternopil',
    test: 'test',
    vitalii: 'vitalii',
    voice: 'voice'
} as const;

type ActionName = (typeof ActionNames)[keyof typeof ActionNames];

const actions = new Map<ActionName, IAction>();
async function importAction(name: string) {
    const module = await import(`../../actions/commands/${name}`);
    return module[name];
}

const actionDescriptions: Record<ActionName, string> = {
    [ActionNames.banner]:
        'Надає актуальну інформацію про поточні та майбутні банери в Genshin Impact',
    [ActionNames.cardSearch]: 'Пошук карток через Scryfall API',
    [ActionNames.dispute]:
        'Аналізує деклісти з MTGGoldfish та надає гумористичні коментарі',
    [ActionNames.dvach]: 'Посилає нахуй за репост з двачу',
    [ActionNames.fang]:
        'Реагує тематичними картинками коли в чаті згадують слова "фанг" або "мотомиш"',
    [ActionNames.gptIsTrue]: 'GROK IS THIS TRUE',
    [ActionNames.gpt]:
        'Використовує ШІ для генерації контекстуальних відповідей на випадкові повідомлення',
    [ActionNames.hello]:
        'Автоматично відповідає "hello" коли хтось пише "нi" в чаті',
    [ActionNames.kamaz]:
        'Автоматично ділиться тематичною картинкою коли згадують "камаз"',
    [ActionNames.long]:
        'Виявляє надмірно довгі повідомлення та реагує картинкою',
    [ActionNames.lotus]:
        'Публікує картинки зі дампінг сферою у відповідь на згадки про "лотос"',
    [ActionNames.nameSave]:
        'Фоновий сервіс, що зберігає останні нікнейми користувачів',
    [ActionNames.pizda]: 'Відповідає "пізда" на повідомлення "да"',
    [ActionNames.ponyav]:
        'Відповідає жартом "в штани намоняв" коли хтось пише "поняв"',
    [ActionNames.potuzhno]:
        'Випадковим чином реагує "Потужно" на повідомлення та веде рахунок активності користувачів',
    [ActionNames.potuzhnoStats]:
        'Показує топ-10 учасників чату за рейтингом "потужності"',
    [ActionNames.rating]: 'Рандомно відповідає на посилання на ютуб відео.',
    [ActionNames.registration]: 'Показує регу на івенти в МВ',
    [ActionNames.rozklad]: 'Показує розклад в Отаварі',
    [ActionNames.ru]: 'русскій воєнний корабль іді нахуй',
    [ActionNames.sadwhy]:
        'Реагує сумними/емоційними реакціями коли негативно згадують "железяка"',
    [ActionNames.slon]: 'Реагує на згадки "слон" тематичним відео',
    [ActionNames.ternopil]:
        'Надає спеціальні відповіді на повідомлення від користувачів з Тернополя',
    [ActionNames.test]: 'тест',
    [ActionNames.vitalii]: 'Відслідковує коли Віталій згадує "маліфо"',
    [ActionNames.voice]: 'Посилає нахуй за голосовухі'
};

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
    if (!actions.has(actionName)) {
        const action = await importAction(actionName);
        actions.set(actionName, action);
    }
    const action = actions.get(actionName)!;

    return [
        action.key,
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
