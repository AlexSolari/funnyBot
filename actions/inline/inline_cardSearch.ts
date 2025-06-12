import { InlineQueryActionBuilder } from 'chz-telegram-bot';
import { IScryfallCardFace } from '../../types/externalApiDefinitions/scryfall';
import escapeMarkdown from '../../helpers/escapeMarkdown';
import { ScryfallService } from '../../services/scryfallService';
import capitalizeFirstLetter from '../../helpers/capitalizeFirstLetter';

export default new InlineQueryActionBuilder('Inline.CardSearch')
    .do(async (ctx) => {
        let prefix = '';
        let query = ctx.queryText;

        if (ctx.queryText[0] == '#') {
            const [hash, ...rest] = ctx.queryText.split(' ');
            query = rest.join(' ');
            prefix = hash.slice(1);
        }

        if (query.length == 0) return;

        let showSetCode = false;
        let cards = await ScryfallService.findExact(query);

        if (cards.length == 0) {
            cards = await ScryfallService.findWithQuery(query);
        }

        let results: IScryfallCardFace[] = [];
        if (cards.length == 1) {
            showSetCode = true;
            results = await ScryfallService.findAllArtworks(cards[0].name);
        } else {
            results = cards;
        }

        if (results.length > 50) results = results.slice(0, 49);

        for (const card of results) {
            ctx.showInlineQueryResult({
                type: 'article',
                id: Math.random().toString(),
                title: showSetCode
                    ? `${card.name} - ${card.set_name ?? 'Unknown'}`
                    : card.name,
                description: getDescription(card, prefix),
                thumbnail_url:
                    card.image_uris?.art_crop ??
                    card.image_uris?.normal ??
                    ScryfallService.cardBack,
                input_message_content: {
                    message_text: getTextMessage(card, prefix),
                    parse_mode: 'MarkdownV2'
                }
            });
        }
    })
    .build();

function getTextMessage(card: IScryfallCardFace, prefix: string) {
    const baseText = `[\\${escapeMarkdown(card.name)}](${
        card.image_uris?.normal ?? ScryfallService.cardBack
    })`;

    if (prefix == 'bans' && card.legalities) {
        const bansText = Object.entries(card.legalities)
            .sort(([_1, legality1], [_2, legality2]) =>
                legality1.localeCompare(legality2)
            )
            .map(
                ([format, legality]) =>
                    `*${capitalizeFirstLetter(
                        format
                    )}*: _${capitalizeFirstLetter(legality.replace('_', ' '))}_`
            )
            .join('\n');

        if (bansText.length > 0) {
            return baseText + `\n\n${bansText}`;
        }
    }

    if (prefix == 'price' && card.prices?.usd) {
        return (
            baseText + `\n\n TCGPlayer: *${escapeMarkdown(card.prices.usd)}*$`
        );
    }

    return baseText;
}
function getDescription(card: IScryfallCardFace, prefix: string) {
    if (prefix == 'price' && card.prices?.usd) {
        return `${card.prices.usd}$`;
    }

    return `${card.type_line ?? ''}\n${card.flavor_text ?? ''}`;
}
