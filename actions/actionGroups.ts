import { ActionStateBase } from 'chz-telegram-bot';
import { CommandAction } from 'chz-telegram-bot/dist/entities/actions/commandAction';
import { ScheduledAction } from 'chz-telegram-bot/dist/entities/actions/scheduledAction';
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
import spamlol from './commands/spamlol';
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

export const testCommands = {
    commands: [
        test,
        cardSearch_small,
        pizda,
        banner,
        ru,
        potuzhno,
        potuzhnoStats,
        nameSave
    ] as CommandAction<ActionStateBase>[],
    scheduled: [] as ScheduledAction<ActionStateBase>[],
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
        spamlol,
        ternopil,
        vitalii,
        nameSave
    ] as CommandAction<ActionStateBase>[],
    scheduled: [meta, lowCount] as ScheduledAction<ActionStateBase>[],
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
        nameSave
    ] as CommandAction<ActionStateBase>[],
    scheduled: [becker] as unknown as ScheduledAction<ActionStateBase>[]
};
