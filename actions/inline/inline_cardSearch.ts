import { InlineQueryActionBuilder, TypedEventEmitter } from 'chz-telegram-bot';
import { ScryfallService } from '../../services/scryfallService';
import { MtgCardSearchService } from '../../services/cardSearchService';
import { ScryfallEventMap } from '../../types/scryfallEvents';

export const inlineCardSearch = new InlineQueryActionBuilder(
    'Inline.CardSearch'
)
    .do(async (ctx) => {
        const { eventEmitter, traceId } = ctx.observability;
        const observability = {
            emitter: eventEmitter as TypedEventEmitter<ScryfallEventMap>,
            traceId
        };

        const { cardsWithText, showSetCode } =
            await MtgCardSearchService.findForInlineQuery(
                ctx.queryText,
                ctx.abortSignal,
                observability
            );

        for (const cardData of cardsWithText) {
            ctx.showInlineQueryResult({
                type: 'article',
                id: Math.random().toString(),
                title: showSetCode
                    ? `${cardData.card.name} - ${
                          cardData.card.set_name ?? 'Unknown'
                      }`
                    : cardData.card.name,
                description: cardData.description,
                thumbnail_url:
                    cardData.card.image_uris?.art_crop ??
                    cardData.card.image_uris?.normal ??
                    ScryfallService.cardBack,
                input_message_content: {
                    message_text: cardData.responseText,
                    parse_mode: 'MarkdownV2'
                }
            });
        }
    })
    .build();
