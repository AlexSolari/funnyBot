import { ChatId } from '../../types/chatIds';
import {
    BotEventType,
    ScheduledActionBuilderWithState
} from 'chz-telegram-bot';
import BeckerState from '../../state/beckerState';
import escapeMarkdown from '../../helpers/escapeMarkdown';
import { randomInt } from '../../helpers/randomInt';
import { CmerApiResponse } from '../../types/externalApiDefinitions/cmer';
import { traceFetch } from '../../helpers/fetchWithObservability';
import { getObservability } from '../../helpers/getObservability';

export const becker = new ScheduledActionBuilderWithState<BeckerState>(
    'Scheduled.Becker',
    () => new BeckerState()
)
    .runAt(11)
    .in([ChatId.GenshinChat])
    .do(async (ctx, _, state) => {
        try {
            const offset = randomInt(0, 26) * 50;
            const contentPage = await traceFetch(
                `https://coomer.st/api/v1/onlyfans/user/alina_becker/posts?o=${offset}`,
                getObservability(ctx),
                { headers: { Accept: 'text/css' } }
            );

            if (!contentPage.ok) {
                throw new Error(
                    `Failed to fetch content page: ${contentPage.statusText}`
                );
            }

            const data = (await contentPage.json()) as CmerApiResponse;
            const images = data.filter((x) => x.file.path.endsWith('.jpg'));
            const imageContainer = images[randomInt(0, images.length - 1)];

            if (imageContainer.id != state.id) {
                state.id = imageContainer.id;

                ctx.send.text(
                    `[${escapeMarkdown(
                        imageContainer.title
                    )}](https://img.coomer.st/thumbnail/data${
                        imageContainer.file.path
                    })`
                );
            }
        } catch (error) {
            ctx.observability.eventEmitter.emit(BotEventType.error, {
                error: error as Error,
                traceId: ctx.observability.traceId
            });

            ctx.send.text('Беккеровозы в чат не приехали 😭');
        }
    })
    .build();
