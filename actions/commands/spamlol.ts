import {
    CommandActionBuilderWithState,
    MessageType,
    Seconds
} from 'chz-telegram-bot';
import { ChatId } from '../../types/chatIds';
import { SpecificUsers } from '../../types/userIds';
import SpamState from '../../entities/spamState';
import { randomInt } from '../../helpers/randomInt';

export default new CommandActionBuilderWithState(
    'Reaction.Spamlol',
    () => new SpamState(36)
)
    .on(MessageType.NewChatMember)
    .from(SpecificUsers.m_1kyyqq)
    .when((ctx) => ctx.chatInfo.id == ChatId.LvivChat)
    .do(async (ctx, state) => {
        state.count += 1;

        const remainder = state.count % 10;
        let suffix = 'ів';

        if (remainder == 1) suffix = '';
        else if (remainder >= 2 && remainder <= 4) suffix = 'и';

        const remainder69 = state.count % 69;
        if (remainder69 == 0) {
            ctx.reply.withText(
                `Бот заходив вже ${state.count} \\(69 \\* ${
                    state.count / 69
                }\\) раз${suffix}`
            );
            ctx.reply.withVideo('nice');
            return;
        } else if (randomInt(0, 3) == 0) {
            ctx.reply.withText(`Бот заходив вже ${state.count} раз${suffix}`);
        } else {
            ctx.reply.withReaction('🥴');
        }
    })
    .cooldown(0 as Seconds)
    .build();
