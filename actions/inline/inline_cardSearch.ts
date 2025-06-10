import { InlineQueryActionBuilder } from 'chz-telegram-bot';
import { IScryfallCardFace } from '../../types/externalApiDefinitions/scryfall';
import escapeMarkdown from '../../helpers/escapeMarkdown';
import { ScryfallService } from '../../services/scryfallService';

export default new InlineQueryActionBuilder('Inline.CardSearch')
    .do(async (ctx) => {
        if (ctx.queryText.length == 0) return;

        let showSetCode = false;
        let cards = await ScryfallService.findExact(ctx.queryText);

        if (cards.length == 0) {
            cards = await ScryfallService.findWithQuery(ctx.queryText);
        }

        let results: IScryfallCardFace[] = [];
        if (cards.length == 1) {
            results = (
                await ScryfallService.findAllArtworks(cards[0].name)
            ).filter((x) => x.name == cards[0].name);

            showSetCode = true;
        } else {
            results = cards;
        }

        if (results.length > 50) results = results.slice(0, 49);

        for (const card of results) {
            if (!card) continue;

            ctx.showInlineQueryResult({
                type: 'article',
                id: Math.random().toString(),
                title: showSetCode
                    ? `${card.name} - ${card.set_name ?? 'Unknown'}`
                    : card.name,
                description: `${card.type_line ?? ''}\n${
                    card.flavor_text ?? ''
                }`,
                thumbnail_url:
                    card.image_uris?.art_crop ??
                    card.image_uris?.normal ??
                    ScryfallService.cardBack,
                input_message_content: {
                    message_text: `[\\${escapeMarkdown(card.name)}](${
                        card.image_uris?.normal ?? ScryfallService.cardBack
                    })`,
                    parse_mode: 'MarkdownV2'
                }
            });
        }
    })
    .build();
