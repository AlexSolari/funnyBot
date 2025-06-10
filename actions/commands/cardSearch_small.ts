import { CommandActionBuilder } from 'chz-telegram-bot';
import { ChatId } from '../../types/chatIds';
import { ScryfallService } from '../../services/scryfallService';
import capitalizeFirstLetter from '../../helpers/capitalizeFirstLetter';

const TELEGRAM_MAX_MESSAGE_LENGTH = 3000;

export default new CommandActionBuilder('Reaction.CardSearch_Small')
    .on(/\[([^[]+)\]/gi)
    .do(async (ctx) => {
        for (const matchResult of ctx.matchResults) {
            const firstRegexMatch = matchResult[1];
            let rulesText = '';
            let useBack = false;
            let fetchRules = false;
            let showBans = false;

            const hasSubquery =
                firstRegexMatch.includes('|') || firstRegexMatch.includes('#');
            const delimiter = hasSubquery
                ? firstRegexMatch.includes('|')
                    ? '|'
                    : '#'
                : null;
            const [query, subquery] = hasSubquery
                ? firstRegexMatch.split(delimiter!)
                : [firstRegexMatch, ''];

            if (hasSubquery && subquery.includes('flip')) {
                useBack = true;
            }
            if (hasSubquery && subquery.includes('rules')) {
                fetchRules = true;
            }
            if (hasSubquery && subquery.includes('bans')) {
                showBans = true;
            }

            const sanitizedSubquery = subquery
                .replace('flip', '')
                .replace('rules', '')
                .replace('bans', '')
                .trim();

            const cards =
                sanitizedSubquery.length == 0
                    ? await ScryfallService.findFuzzy(query)
                    : await ScryfallService.findWithQuery(
                          `${query} ${sanitizedSubquery}`
                      );

            if (useBack) cards.shift();
            console.log(cards);
            const resultCard = cards[0];

            if (!resultCard) continue;

            if (fetchRules) {
                rulesText = await ScryfallService.getRules(resultCard);
            }

            let bansText = '';
            if (showBans) {
                for (const [format, legality] of Object.entries(
                    resultCard.legalities
                )) {
                    if (legality == 'not_legal') continue;

                    bansText += `*${capitalizeFirstLetter(
                        format
                    )}*: _${capitalizeFirstLetter(legality)}_\n`;
                }
            }

            const images = cards.map(
                (card) => card.image_uris.normal ?? ScryfallService.cardBack
            );

            let extraText = '';
            if (rulesText) {
                extraText += `\n\n*Rules:*\n${rulesText}`;
            }
            if (bansText) {
                extraText += `\n\n${bansText}`;
            }

            let message = `[\\.](${
                images[0] ?? ScryfallService.cardBack
            })${extraText}`;

            if (message.length > TELEGRAM_MAX_MESSAGE_LENGTH) {
                while (message.length > TELEGRAM_MAX_MESSAGE_LENGTH) {
                    const lastNewLineIndex = message.lastIndexOf(
                        '\n\n',
                        TELEGRAM_MAX_MESSAGE_LENGTH
                    );

                    if (
                        lastNewLineIndex !== -1 &&
                        lastNewLineIndex < TELEGRAM_MAX_MESSAGE_LENGTH
                    ) {
                        const chunk = message.slice(0, lastNewLineIndex);
                        message = message.slice(lastNewLineIndex + 2);

                        ctx.replyWithText(chunk);
                    }
                }
            } else {
                ctx.replyWithText(message);
            }
        }
    })
    .ignoreChat(ChatId.GenshinChat)
    .build();
