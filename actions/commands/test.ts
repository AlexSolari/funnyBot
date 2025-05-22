/* eslint-disable @typescript-eslint/no-unused-vars */
import { CommandActionBuilderWithState, Milliseconds } from 'chz-telegram-bot';
import { ChatId } from '../../types/chatIds';
import TestState from '../../entities/testState';

const testActionBuilder = new CommandActionBuilderWithState<TestState>(
    'Reaction.Test',
    () => new TestState()
)
    .on('test')
    .when((ctx) => ctx.chatInfo.id == ChatId.TestChat)
    .do(async (ctx, state) => {});

if (process.env.NODE_ENV == 'production') {
    testActionBuilder.disabled();
}

export default testActionBuilder.build();
