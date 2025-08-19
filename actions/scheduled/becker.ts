import { ChatId } from '../../types/chatIds';
import { ScheduledActionBuilderWithState } from 'chz-telegram-bot';
import BeckerState from '../../state/beckerState';
import escapeMarkdown from '../../helpers/escapeMarkdown';
import { randomInt } from '../../helpers/randomInt';
import { CmerApiResponse } from '../../types/externalApiDefinitions/cmer';

export const becker = new ScheduledActionBuilderWithState<BeckerState>(
    'Scheduled.Becker',
    () => new BeckerState()
)
    .runAt(11)
    .in([ChatId.GenshinChat])
    .do(async (ctx, _, state) => {
        const offset = randomInt(0, 26) * 50;
        const contentPage = await fetch(
            `https://coomer.st/api/v1/onlyfans/user/alina_becker/posts?o=${offset}`,
            { headers: { Accept: 'text/css' } }
        );
        const data = (await contentPage.json()) as CmerApiResponse;
        const images = data.filter((x) => x.file.path.endsWith('.jpg'));
        const imageContainer = images[randomInt(0, images.length)];

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
    })
    .build();
