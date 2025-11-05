import { CommandAction, IActionState, ScheduledAction } from 'chz-telegram-bot';
import { banner } from './commands/banner';
import { cardSearch } from './commands/cardSearch';
import { dispute } from './commands/dispute';
import { fang } from './commands/fang';
import { hello } from './commands/hello';
import { kamaz } from './commands/kamaz';
import { lotus } from './commands/lotus';
import { pizda } from './commands/pizda';
import { ponyav } from './commands/ponyav';
import { potuzhno } from './commands/potuzhno';
import { potuzhnoStats } from './commands/potuzhnoStats';
import { rating } from './commands/rating';
import { registration } from './commands/registration';
import { rozklad } from './commands/rozklad';
import { slon } from './commands/slon';
import { ternopil } from './commands/ternopil';
import { test } from './commands/test';
import { vitalii } from './commands/vitalii';
import { becker } from './scheduled/becker';
import { lowCount } from './scheduled/lowCount';
import { meta } from './scheduled/meta';
import { inlineCardSearch } from './inline/inline_cardSearch';
import { dvach } from './commands/dvach';
import { ru } from './commands/ru';
import { nameSave } from './commands/nameSave';
import { long } from './commands/long';
import { voice } from './commands/voice';
import { gpt } from './commands/gpt';
import { gptIsTrue } from './commands/gptIsTrue';
import { sadwhy } from './commands/sadwhy';
import { discussion } from './commands/discussion';

const commands = [
    cardSearch,
    dispute,
    fang,
    hello,
    kamaz,
    lotus,
    pizda,
    ponyav,
    potuzhno,
    potuzhnoStats,
    rating,
    registration,
    rozklad,
    slon,
    ternopil,
    vitalii,
    nameSave,
    long,
    voice,
    gpt,
    gptIsTrue,
    sadwhy,
    banner,
    test,
    dvach,
    ru,
    discussion
] as CommandAction<IActionState>[];

export const testCommands = {
    commands,
    scheduled: [] as ScheduledAction<IActionState>[],
    inline: [inlineCardSearch]
};

export const mtgCommands = {
    commands,
    scheduled: [meta, lowCount] as ScheduledAction<IActionState>[],
    inline: [inlineCardSearch]
};

export const genshinCommands = {
    commands,
    scheduled: [becker] as unknown as ScheduledAction<IActionState>[]
};
