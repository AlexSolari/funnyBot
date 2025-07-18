import { CommandAction, IActionState, ScheduledAction } from 'chz-telegram-bot';
import banner from './commands/banner';
import cardSearch_small from './commands/cardSearch_small';
import dispute from './commands/dispute';
import fang from './commands/fang';
import hello from './commands/hello';
import kamaz from './commands/kamaz';
import lotus from './commands/lotus';
import pizda from './commands/pizda';
import ponyav from './commands/ponyav';
import potuzhno from './commands/potuzhno';
import potuzhnoStats from './commands/potuzhnoStats';
import rating from './commands/rating';
import registration from './commands/registration';
import rozklad from './commands/rozklad';
import slon from './commands/slon';
import ternopil from './commands/ternopil';
import test from './commands/test';
import vitalii from './commands/vitalii';
import becker from './scheduled/becker';
import lowCount from './scheduled/lowCount';
import meta from './scheduled/meta';
import inline_cardSearch from './inline/inline_cardSearch';
import dvach from './commands/dvach';
import ru from './commands/ru';
import nameSave from './commands/nameSave';
import long from './commands/long';
import dvach_silentForward from './commands/dvach_silentForward';
import voice from './commands/voice';
import gpt from './commands/gpt';
import gpt_isTrue from './commands/gpt_isTrue';

export const testCommands = {
    commands: [
        test,
        cardSearch_small,
        pizda,
        banner,
        potuzhno,
        potuzhnoStats,
        nameSave,
        gpt
    ] as CommandAction<IActionState>[],
    scheduled: [] as ScheduledAction<IActionState>[],
    inline: [inline_cardSearch]
};

export const mtgCommands = {
    commands: [
        cardSearch_small,
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
        gpt_isTrue
    ] as CommandAction<IActionState>[],
    scheduled: [meta, lowCount] as ScheduledAction<IActionState>[],
    inline: [inline_cardSearch]
};

export const genshinCommands = {
    commands: [
        banner,
        hello,
        pizda,
        potuzhno,
        potuzhnoStats,
        dvach,
        ru,
        nameSave,
        long,
        dvach_silentForward,
        gpt_isTrue
    ] as CommandAction<IActionState>[],
    scheduled: [becker] as unknown as ScheduledAction<IActionState>[]
};
