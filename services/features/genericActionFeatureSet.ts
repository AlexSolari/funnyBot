import { ActionKey, IAction } from 'chz-telegram-bot/dist/types/action';
import { ChatId } from '../../types/chatIds';
import { test } from '../../actions/commands/test';
import { Hours, hoursToSeconds, Seconds } from 'chz-telegram-bot';
import { dispute } from '../../actions/commands/dispute';
import { fang } from '../../actions/commands/fang';
import { hello } from '../../actions/commands/hello';
import { kamaz } from '../../actions/commands/kamaz';
import { lotus } from '../../actions/commands/lotus';
import { pizda } from '../../actions/commands/pizda';
import { ponyav } from '../../actions/commands/ponyav';
import { potuzhno } from '../../actions/commands/potuzhno';
import { potuzhnoStats } from '../../actions/commands/potuzhnoStats';
import { rating } from '../../actions/commands/rating';
import { registration } from '../../actions/commands/registration';
import { rozklad } from '../../actions/commands/rozklad';
import { slon } from '../../actions/commands/slon';
import { ternopil } from '../../actions/commands/ternopil';
import { vitalii } from '../../actions/commands/vitalii';
import { nameSave } from '../../actions/commands/nameSave';
import { long } from '../../actions/commands/long';
import { voice } from '../../actions/commands/voice';
import { gpt } from '../../actions/commands/gpt';
import { gptIsTrue } from '../../actions/commands/gpt_isTrue';
import { sadwhy } from '../../actions/commands/sadwhy';
import { banner } from '../../actions/commands/banner';
import { dvach } from '../../actions/commands/dvach';
import { ru } from '../../actions/commands/ru';
import { cardSearch } from '../../actions/commands/cardSearch_small';
import escapeMarkdown from '../../helpers/escapeMarkdown';
import { SpecificUsers } from '../../types/userIds';

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

export function createDefaultBotConfig(): BotFeatureSetsConfiguration {
    const createFeatureSet = (
        action: IAction,
        active: boolean,
        cooldownSeconds: number,
        optional?: {
            cooldownMessage?: string;
            chatWhitelist?: ChatId[];
            chatBlacklist?: ChatId[];
            userWhitelist?: SpecificUsers[];
            extraFeatures?: Map<string, boolean>;
        }
    ): readonly [ActionKey, ActionFeatureSet] => {
        const actionDescriptions = {
            [cardSearch.key]: 'Пошук карток через Scryfall API',
            [dispute.key]:
                'Аналізує деклісти з MTGGoldfish та надає гумористичні коментарі',
            [fang.key]:
                'Реагує тематичними картинками коли в чаті згадують слова "фанг" або "мотомиш"',
            [hello.key]:
                'Автоматично відповідає "hello" коли хтось пише "нi" в чаті',
            [kamaz.key]:
                'Автоматично ділиться тематичною картинкою коли згадують "камаз"',
            [lotus.key]:
                'Публікує картинки зі дампінг сферою у відповідь на згадки про "лотос"',
            [pizda.key]: 'Відповідає "пізда" на повідомлення "да"',
            [ponyav.key]:
                'Відповідає жартом "в штани намоняв" коли хтось пише "поняв"',
            [potuzhno.key]:
                'Випадковим чином реагує "Потужно" на повідомлення та веде рахунок активності користувачів',
            [potuzhnoStats.key]:
                'Показує топ-10 учасників чату за рейтингом "потужності"',
            [rating.key]: 'Рандомно відповідає на посилання на ютуб відео.',
            [registration.key]: 'Показує регу на івенти в МВ',
            [rozklad.key]: 'Показує розклад в Отаварі',
            [slon.key]: 'Реагує на згадки "слон" тематичним відео',
            [ternopil.key]:
                'Надає спеціальні відповіді на повідомлення від користувачів з Тернополя',
            [vitalii.key]: 'Відслідковує коли Віталій згадує "маліфо"',
            [nameSave.key]:
                'Фоновий сервіс, що зберігає останні нікнейми користувачів',
            [long.key]:
                'Виявляє надмірно довгі повідомлення та реагує картинкою',
            [voice.key]: 'Посилає нахуй за голосовухі',
            [gpt.key]:
                'Використовує ШІ для генерації контекстуальних відповідей на випадкові повідомлення',
            [gptIsTrue.key]: 'GROK IS THIS TRUE',
            [sadwhy.key]:
                'Реагує сумними/емоційними реакціями коли негативно згадують "железяка"',
            [banner.key]:
                'Надає актуальну інформацію про поточні та майбутні банери в Genshin Impact',
            [dvach.key]: 'Посилає нахуй за репост з двачу',
            [ru.key]: 'русскій воєнний корабль іді нахуй',
            [test.key]: 'тест'
        };

        return [
            action.key,
            {
                description: actionDescriptions[action.key],
                active,
                cooldownSeconds: cooldownSeconds as Seconds,
                cooldownMessage: optional?.cooldownMessage,
                chatWhitelist: optional?.chatWhitelist ?? [],
                chatBlacklist: optional?.chatBlacklist ?? [],
                userWhitelist: optional?.userWhitelist ?? [],
                extraFeatures: optional?.extraFeatures ?? new Map()
            }
        ];
    };

    return {
        default: new Map([
            createFeatureSet(banner, false, 30),
            createFeatureSet(cardSearch, true, 0),
            createFeatureSet(dispute, true, hoursToSeconds(2 as Hours), {
                chatWhitelist: [ChatId.PauperChat]
            }),
            createFeatureSet(dvach, true, 1, {
                chatWhitelist: [ChatId.GenshinChat]
            }),
            createFeatureSet(fang, true, hoursToSeconds(2 as Hours), {
                chatWhitelist: [ChatId.PioneerChat]
            }),
            createFeatureSet(gptIsTrue, true, 60, {
                cooldownMessage: escapeMarkdown(
                    `Наразі не можу перевірити, спробуйте пізніше.`
                )
            }),
            createFeatureSet(gpt, true, hoursToSeconds(20 as Hours), {
                chatBlacklist: [ChatId.PauperChat]
            }),
            createFeatureSet(hello, true, hoursToSeconds(2 as Hours), {
                chatBlacklist: [
                    ChatId.LvivChat,
                    ChatId.FrankivskChat,
                    ChatId.GenshinChat
                ]
            }),
            createFeatureSet(kamaz, true, hoursToSeconds(2 as Hours), {
                chatWhitelist: [ChatId.PioneerChat]
            }),
            createFeatureSet(long, true, hoursToSeconds(20 as Hours), {
                chatBlacklist: [ChatId.PauperChat]
            }),
            createFeatureSet(lotus, true, hoursToSeconds(2 as Hours), {
                chatWhitelist: [ChatId.PioneerChat]
            }),
            createFeatureSet(nameSave, true, 0),
            createFeatureSet(pizda, true, hoursToSeconds(2 as Hours), {
                chatBlacklist: [
                    ChatId.LvivChat,
                    ChatId.FrankivskChat,
                    ChatId.PauperChat,
                    ChatId.CbgChat
                ]
            }),
            createFeatureSet(ponyav, true, hoursToSeconds(2 as Hours), {
                chatBlacklist: [ChatId.GenshinChat, ChatId.PauperChat]
            }),

            createFeatureSet(potuzhno, true, hoursToSeconds(4 as Hours), {
                chatBlacklist: [ChatId.PauperChat]
            }),
            createFeatureSet(potuzhnoStats, true, 30, {
                chatBlacklist: [ChatId.PauperChat]
            }),
            createFeatureSet(rating, true, hoursToSeconds(2 as Hours), {
                chatBlacklist: [
                    ChatId.LvivChat,
                    ChatId.FrankivskChat,
                    ChatId.PauperChat,
                    ChatId.CbgChat
                ]
            }),
            createFeatureSet(registration, true, 30, {
                chatWhitelist: [
                    ChatId.StandardChat,
                    ChatId.ModernChat,
                    ChatId.PioneerChat
                ]
            }),
            createFeatureSet(rozklad, true, 30, {
                chatWhitelist: [ChatId.LvivChat]
            }),
            createFeatureSet(ru, false, hoursToSeconds(1 as Hours)),
            createFeatureSet(sadwhy, true, 30, {
                chatBlacklist: [ChatId.PauperChat]
            }),
            createFeatureSet(slon, true, hoursToSeconds(2 as Hours), {
                chatBlacklist: [
                    ChatId.PauperChat,
                    ChatId.FrankivskChat,
                    ChatId.FnmChat,
                    ChatId.GenshinChat
                ]
            }),
            createFeatureSet(ternopil, true, hoursToSeconds(8 as Hours), {
                chatWhitelist: [ChatId.LvivChat],
                userWhitelist: [
                    SpecificUsers.pontiff,
                    SpecificUsers.trigan,
                    SpecificUsers.zohan
                ]
            }),
            createFeatureSet(test, false, 1),
            createFeatureSet(vitalii, true, hoursToSeconds(24 as Hours), {
                chatWhitelist: [ChatId.LvivChat],
                userWhitelist: [SpecificUsers.vitalii]
            }),
            createFeatureSet(voice, true, hoursToSeconds(1 as Hours), {
                chatWhitelist: [ChatId.FrankivskChat]
            })
        ]),
        botseiju: new Map([]),
        kekruga: new Map([]),
        xiao: new Map([
            createFeatureSet(banner, true, 30),
            createFeatureSet(ru, true, hoursToSeconds(1 as Hours))
        ]),
        test: new Map([
            createFeatureSet(test, true, 1, {
                extraFeatures: new Map([['test', true]])
            })
        ])
    };
}
