/* eslint-disable @typescript-eslint/no-unused-vars */
import { CommandActionBuilderWithState } from 'chz-telegram-bot';
import TestState from '../../state/testState';
import { featureProvider } from '../../services/featureProvider';
import { configuration } from '../../helpers/getFeatures';

const testActionBuilder = new CommandActionBuilderWithState<TestState>(
    'Reaction.Test',
    () => new TestState()
)
    .on('test')
    .withConfiguration(configuration)
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
