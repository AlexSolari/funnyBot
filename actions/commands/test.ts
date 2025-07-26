/* eslint-disable @typescript-eslint/no-unused-vars */
import TestState from '../../state/testState';
import { featureProvider } from '../../services/featureProvider';
import { CommandBuilderWithState } from '../../helpers/commandBuilder';

const testActionBuilder = new CommandBuilderWithState<TestState>(
    'Reaction.Test',
    TestState
)
    .on('test')
    .do(async (ctx, state) => {
        const features = featureProvider.getFeaturesForAction(
            ctx.botName,
            ctx.actionKey
        );
        if (features.extraFeatures.get('test'))
            ctx.reply.withText('test response feature on');
        else ctx.reply.withText('test response feature off');
    });

export const test = testActionBuilder.build();
