/* eslint-disable @typescript-eslint/no-unused-vars */
import { CommandActionBuilderWithState } from 'chz-telegram-bot';
import { ChatId } from '../../types/chatIds';
import TestState from '../../entities/testState';

const testActionBuilder = new CommandActionBuilderWithState<TestState>(
    'Reaction.Test',
    () => new TestState()
)
    .on('test')
    .in([ChatId.TestChat])
    .do(async (ctx, state) => {
        ctx.reply.withText('test response');
    });

if (process.env.NODE_ENV == 'production') {
    testActionBuilder.disabled();
}

export default testActionBuilder.build();
