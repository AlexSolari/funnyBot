import {
    CommandActionBuilderWithState,
    MessageType,
    Seconds
} from 'chz-telegram-bot';
import { ChatId } from '../../types/chatIds';
import { SpecificUsers } from '../../types/userIds';
import SpamState from '../../entities/spamState';

export default new CommandActionBuilderWithState(
    'Reaction.Spamlol',
    () => new SpamState(36)
)
    .on(MessageType.NewChatMember)
    .from(SpecificUsers.m_1kyyqq)
    .when((ctx) => ctx.chatInfo.id == ChatId.LvivChat)
    .do(async (ctx, state) => {
        state.count += 1;

        if (state.count % 69 == 0) {
            ctx.replyWithImage('spam69');
            return;
        }

        const remainder = state.count % 10;
        if (remainder == 0) {
            ctx.replyWithImage('spam');
            return;
        }

        let suffix = 'ів';

        if (remainder == 1) suffix = '';
        else if (remainder >= 2 && remainder <= 4) suffix = 'и';

        ctx.replyWithText(`Бот заходив вже ${state.count} раз${suffix}`);
    })
    .cooldown(0 as Seconds)
    .build();
