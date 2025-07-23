import { ActionKey } from 'chz-telegram-bot/dist/types/action';
import { ChatId } from '../../types/chatIds';
import { test } from '../../actions/commands/test';
import { cardSearch } from '../../actions/commands/cardSearch_small';
import { Hours, hoursToSeconds } from 'chz-telegram-bot';
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

export interface ActionFeatureSet {
    description: string;
    active: boolean;
    cooldownSeconds: number;
    extraFeatures: Map<string, boolean>;
}

export function createDefaultBotConfig(): BotFeatureSetsConfiguration {
    const actionDescriptions = {
        [cardSearch.key]:
            'MTG Card Search: Find Magic: The Gathering cards by typing [cardname]. Returns card image and details',
        [dispute.key]:
            'MTG Deck Critic: Analyzes MTGGoldfish deck links and provides humorous Rakdos-themed criticism of card choices',
        [fang.key]:
            "Fang/Motomysh Detector: Responds with themed Fang-related images when chat mentions keywords 'fang' or 'motomysh'",
        [hello.key]:
            "Greeting Bot: Auto-responds with 'hello' when anyone types 'ni' in chat - simple chat interaction",
        [kamaz.key]:
            "Kamaz Trigger: Automatically shares a Kamaz-themed image whenever 'kamaz' is mentioned in messages",
        [lotus.key]:
            "Lotus Countermeasure: Posts Damping Sphere images as a joke response to 'lotus' mentions (MTG reference)",
        [pizda.key]:
            "Da-Pizda Responder: Chat game that replies 'pizda' to messages containing 'da', encouraging wordplay",
        [ponyav.key]:
            "Ponyav Joke Bot: Responds with humorous 'v shtany namonyav' when 'ponyav' is mentioned in chat",
        [potuzhno.key]:
            "Potuzhno Reaction Game: Random chance to react to messages with 'Potuzhno' text/video and maintains user engagement scores",
        [potuzhnoStats.key]:
            'Potuzhno Leaderboard: Displays leaderboard showing top 10 chat members ranked by their potuzhno engagement scores',
        [rating.key]:
            'YouTube Rating Bot: Analyzes shared YouTube links and provides rating/feedback in chat',
        [registration.key]:
            'Tournament Manager: Comprehensive system for handling MTG tournament registrations and participant management',
        [rozklad.key]:
            "Schedule Display: Fetches and displays the current week's schedule from a designated Telegram channel",
        [slon.key]:
            "Slon Video Response: Detects 'slon' mentions and responds with a themed video clip",
        [ternopil.key]:
            'Ternopil User Monitor: Provides special interactive responses for messages from users identified as being from Ternopil',
        [vitalii.key]:
            "Vitalii's Malifo Watch: Specifically tracks when user Vitalii mentions 'malifo' and responds with themed image",
        [nameSave.key]:
            "Username Tracker: Background service that maintains a database of users' most recent usernames for reference",
        [long.key]:
            'Message Length Monitor: Detects exceptionally long messages and responds with a reaction image',
        [voice.key]:
            'Voice Message Handler: Processes and manages voice message interactions in the chat',
        [gpt.key]:
            'ChatGPT Integration: Uses AI to generate contextual responses to random messages for enhanced chat interaction',
        [gptIsTrue.key]:
            'GPT Truth Validator: Provides validation and fact-checking for ChatGPT-generated responses',
        [sadwhy.key]:
            "Zhelezyaka Mood Bot: Responds with sad/emotional reactions when 'zhelezyaka' is mentioned",
        [banner.key]:
            'Genshin Banner Info: Provides up-to-date information about current and upcoming Genshin Impact banners',
        [dvach.key]:
            'Content Monitor: Specialized handler for forwarded messages and media content (video/emoji) with custom responses',
        [ru.key]:
            'Language Monitor: Detects and responds to usage of Russian language in messages',
        [test.key]:
            'Development Test Command: Utility command used for testing new features and functionality'
    } as const;

    const createFeatureSet = (
        key: ActionKey,
        active: boolean,
        cooldownSeconds: number,
        extraFeatures?: Map<string, boolean>
    ): readonly [ActionKey, ActionFeatureSet] => [
        key,
        {
            description: actionDescriptions[key],
            active,
            cooldownSeconds,
            extraFeatures: extraFeatures ?? new Map()
        }
    ];

    return {
        botseiju: new Map([
            [
                ChatId.LvivChat,
                new Map([
                    createFeatureSet(cardSearch.key, true, 0),
                    createFeatureSet(
                        fang.key,
                        true,
                        hoursToSeconds(2 as Hours)
                    ),
                    createFeatureSet(
                        hello.key,
                        true,
                        hoursToSeconds(2 as Hours)
                    ),
                    createFeatureSet(
                        kamaz.key,
                        true,
                        hoursToSeconds(2 as Hours)
                    ),
                    createFeatureSet(
                        lotus.key,
                        true,
                        hoursToSeconds(2 as Hours)
                    ),
                    createFeatureSet(
                        pizda.key,
                        true,
                        hoursToSeconds(2 as Hours)
                    ),
                    createFeatureSet(
                        ponyav.key,
                        true,
                        hoursToSeconds(2 as Hours)
                    ),
                    createFeatureSet(
                        potuzhno.key,
                        true,
                        hoursToSeconds(4 as Hours)
                    ),
                    createFeatureSet(potuzhnoStats.key, true, 0),
                    createFeatureSet(
                        rating.key,
                        true,
                        hoursToSeconds(2 as Hours)
                    ),
                    createFeatureSet(registration.key, true, 0),
                    createFeatureSet(rozklad.key, true, 30),
                    createFeatureSet(
                        slon.key,
                        true,
                        hoursToSeconds(2 as Hours)
                    ),
                    createFeatureSet(
                        ternopil.key,
                        true,
                        hoursToSeconds(8 as Hours)
                    ),
                    createFeatureSet(
                        vitalii.key,
                        true,
                        hoursToSeconds(24 as Hours)
                    ),
                    createFeatureSet(nameSave.key, true, 0),
                    createFeatureSet(
                        long.key,
                        true,
                        hoursToSeconds(20 as Hours)
                    ),
                    createFeatureSet(voice.key, true, 0),
                    createFeatureSet(
                        gpt.key,
                        true,
                        hoursToSeconds(20 as Hours)
                    ),
                    createFeatureSet(gptIsTrue.key, true, 0),
                    createFeatureSet(sadwhy.key, true, 0)
                ])
            ]
        ]),
        kekruga: new Map([
            [
                ChatId.ModernChat,
                new Map([
                    createFeatureSet(cardSearch.key, true, 0),
                    createFeatureSet(
                        dispute.key,
                        true,
                        hoursToSeconds(2 as Hours)
                    ),
                    createFeatureSet(
                        fang.key,
                        true,
                        hoursToSeconds(2 as Hours)
                    ),
                    createFeatureSet(
                        hello.key,
                        true,
                        hoursToSeconds(2 as Hours)
                    ),
                    createFeatureSet(
                        kamaz.key,
                        true,
                        hoursToSeconds(2 as Hours)
                    ),
                    createFeatureSet(
                        lotus.key,
                        true,
                        hoursToSeconds(2 as Hours)
                    ),
                    createFeatureSet(
                        pizda.key,
                        true,
                        hoursToSeconds(2 as Hours)
                    ),
                    createFeatureSet(
                        ponyav.key,
                        true,
                        hoursToSeconds(2 as Hours)
                    ),
                    createFeatureSet(
                        potuzhno.key,
                        true,
                        hoursToSeconds(4 as Hours)
                    ),
                    createFeatureSet(potuzhnoStats.key, true, 0),
                    createFeatureSet(
                        rating.key,
                        true,
                        hoursToSeconds(2 as Hours)
                    ),
                    createFeatureSet(registration.key, true, 0),
                    createFeatureSet(rozklad.key, true, 30),
                    createFeatureSet(
                        slon.key,
                        true,
                        hoursToSeconds(2 as Hours)
                    ),
                    createFeatureSet(
                        ternopil.key,
                        true,
                        hoursToSeconds(8 as Hours)
                    ),
                    createFeatureSet(
                        vitalii.key,
                        true,
                        hoursToSeconds(24 as Hours)
                    ),
                    createFeatureSet(nameSave.key, true, 0),
                    createFeatureSet(
                        long.key,
                        true,
                        hoursToSeconds(20 as Hours)
                    ),
                    createFeatureSet(voice.key, true, 0),
                    createFeatureSet(
                        gpt.key,
                        true,
                        hoursToSeconds(20 as Hours)
                    ),
                    createFeatureSet(gptIsTrue.key, true, 0),
                    createFeatureSet(sadwhy.key, true, 0)
                ])
            ]
        ]),
        xiao: new Map([
            [
                ChatId.GenshinChat,
                new Map([
                    createFeatureSet(banner.key, true, 30),
                    createFeatureSet(
                        hello.key,
                        true,
                        hoursToSeconds(2 as Hours)
                    ),
                    createFeatureSet(
                        pizda.key,
                        true,
                        hoursToSeconds(2 as Hours)
                    ),
                    createFeatureSet(
                        potuzhno.key,
                        true,
                        hoursToSeconds(4 as Hours)
                    ),
                    createFeatureSet(potuzhnoStats.key, true, 0),
                    createFeatureSet(dvach.key, true, 1),
                    createFeatureSet(ru.key, true, hoursToSeconds(1 as Hours)),
                    createFeatureSet(nameSave.key, true, 0),
                    createFeatureSet(
                        long.key,
                        true,
                        hoursToSeconds(20 as Hours)
                    ),
                    createFeatureSet(gptIsTrue.key, true, 0)
                ])
            ]
        ]),
        test: new Map([
            [
                ChatId.TestChat,
                new Map([
                    createFeatureSet(
                        test.key,
                        true,
                        1,
                        new Map([['test', false]])
                    ),
                    createFeatureSet(cardSearch.key, true, 0),
                    createFeatureSet(
                        pizda.key,
                        true,
                        hoursToSeconds(2 as Hours)
                    ),
                    createFeatureSet(banner.key, true, 30),
                    createFeatureSet(
                        potuzhno.key,
                        true,
                        hoursToSeconds(4 as Hours)
                    ),
                    createFeatureSet(potuzhnoStats.key, true, 0),
                    createFeatureSet(nameSave.key, true, 0),
                    createFeatureSet(
                        gpt.key,
                        true,
                        hoursToSeconds(20 as Hours)
                    ),
                    createFeatureSet(dvach.key, true, 1)
                ])
            ]
        ])
    };
}
