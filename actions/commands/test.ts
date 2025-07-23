/* eslint-disable @typescript-eslint/no-unused-vars */
import { CommandActionBuilderWithState } from 'chz-telegram-bot';
import { ChatId } from '../../types/chatIds';
import TestState from '../../state/testState';
import { featureProvider } from '../../services/featureProvider';

const testActionBuilder = new CommandActionBuilderWithState<TestState>(
    'Reaction.Test',
    () => new TestState()
)
    .on('test')
    .in([ChatId.TestChat])
    .do(async (ctx, state) => {
        const set = featureProvider.getFeaturesForAction(
            'test',
            ctx.chatInfo.id,
            ctx.actionKey
        );

        if (set.extraFeatures.get('test')) {
            ctx.reply.withText('test response feature on');
        } else {
            ctx.reply.withText('test response feature off');
        }
    });

if (process.env.NODE_ENV == 'production') {
    testActionBuilder.disabled();
}

export const test = testActionBuilder.build();
