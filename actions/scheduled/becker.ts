import { ChatId } from '../../types/chatIds';
import { ScheduledActionBuilderWithState } from 'chz-telegram-bot';
import BeckerState from '../../entities/beckerState';
import escapeMarkdown from '../../helpers/escapeMarkdown';
import { randomInt } from '../../helpers/randomInt';
import { ICmerApiResponse } from '../../types/externalApiDefinitions/cmer';

export const becker = new ScheduledActionBuilderWithState<BeckerState>(
    'Scheduled.Becker',
    () => new BeckerState()
)
    .runAt(11)
    .in([ChatId.GenshinChat])
    .do(async (ctx, _, state) => {
        const offset = randomInt(0, 21) * 50;
        const contentPage = await fetch(
            `http://coomer.su/api/v1/onlyfans/user/alina_becker/posts-legacy?o=${offset}`
        );
        const data = (await contentPage.json()) as ICmerApiResponse;
        const imageContainer = data.results[randomInt(0, 49)];

        if (imageContainer.id != state.id) {
            state.id = imageContainer.id;

            ctx.send.text(
                `[${escapeMarkdown(
                    imageContainer.title
                )}](https://img.coomer.su/thumbnail/data/${
                    imageContainer.file.path
                })`
            );
        }
    })
    .build();
