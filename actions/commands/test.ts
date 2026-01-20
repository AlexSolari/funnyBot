/* eslint-disable @typescript-eslint/no-unused-vars */
import TestState from '../../state/testState';
import { CommandBuilderWithState } from '../../helpers/commandBuilder';

const testActionBuilder = new CommandBuilderWithState<TestState>(
    'Reaction.Test',
    TestState
)
    .on('test')
    .do(async (ctx, state) => {});

export const test = testActionBuilder.build();
