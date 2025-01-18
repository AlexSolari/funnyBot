import { CommandActionBuilder } from '../../helpers/builders/commandActionBuilder';
import { load } from 'cheerio';
import { ChatId } from '../../types/chatIds';
import { Hours } from '../../types/timeValues';
import randomInteger from '../../helpers/randomInt';
import { hoursToSeconds } from '../../helpers/timeConvertions';

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

        const hasDispute = cards.indexOf('Deadly Dispute') != -1;

        if (hasDispute) {
            ctx.replyWithImage(`dispute${randomInteger(0, 2)}`);
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
