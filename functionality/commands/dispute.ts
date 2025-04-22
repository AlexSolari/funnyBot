import { load } from 'cheerio';
import { CommandActionBuilder, Hours } from 'chz-telegram-bot';
import { ChatId } from '../../types/chatIds';
import { hoursToSeconds } from 'chz-telegram-bot/dist/helpers/timeConvertions';
import { randomInt } from '../../helpers/randomInt';

export default new CommandActionBuilder('Reaction.Dispute')
    .on(/mtggoldfish\.com\/deck\/(\d+)/i)
    .do(async (ctx) => {
        const deckId = ctx.matchResults[0][1];
        const response = await fetch(
            `https://www.mtggoldfish.com/deck/arena_download/${deckId}`
        );
        const text = await response.text();
        const findInDOM = load(text);
        const cards = findInDOM('.copy-paste-box').text();

        const hasOffering = cards.indexOf('Fanatical Offering') != -1;
        const hasEnforcer = cards.indexOf('Myr Enforcer') != -1;

        const isRakdos =
            cards.indexOf('Mountain') != -1 &&
            cards.indexOf('Swamp') != -1 &&
            cards.indexOf('Island') == -1 &&
            cards.indexOf('Plains') == -1 &&
            cards.indexOf('Forest') == -1;

        if (isRakdos) {
            ctx.replyWithText('ми досі про ракдос дрочню?');
        } else if (hasOffering) {
            ctx.replyWithImage(`offering`);
        } else if (hasEnforcer) {
            ctx.replyWithText(
                'ВААААУ! вперше бачу такий набір карт. автор геній!'
            );
        } else if (randomInt(0, 1) == 0) {
            ctx.react('🍌');
        }
    })
    .cooldown(hoursToSeconds(2 as Hours))
    .ignoreChat(ChatId.FnmChat)
    .ignoreChat(ChatId.FrankivskChat)
    .ignoreChat(ChatId.LvivChat)
    .ignoreChat(ChatId.ModernChat)
    .ignoreChat(ChatId.PioneerChat)
    .ignoreChat(ChatId.SpellSeeker)
    .ignoreChat(ChatId.StandardChat)
    .build();
