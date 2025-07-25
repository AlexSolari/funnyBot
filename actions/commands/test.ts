/* eslint-disable @typescript-eslint/no-unused-vars */
import {
    CommandActionBuilderWithState,
    CommandActionProvidersConfiguration
} from 'chz-telegram-bot';
import TestState from '../../state/testState';
import { featureProvider } from '../../services/featureProvider';

const configuration: CommandActionProvidersConfiguration = {
    cooldownProvider: (ctx) => {
        const features = featureProvider.getFeaturesForAction(
            ctx.botName,
            ctx.actionKey
        );
        return {
            cooldown: features.cooldownSeconds,
            message: features.cooldownMessage
        };
    },
    chatsWhitelistProvider: (ctx) =>
        featureProvider.getFeaturesForAction(ctx.botName, ctx.actionKey)
            .chatWhitelist,
    isActiveProvider: (ctx) =>
        featureProvider.getFeaturesForAction(ctx.botName, ctx.actionKey).active,
    chatsBlacklistProvider: (ctx) =>
        featureProvider.getFeaturesForAction(ctx.botName, ctx.actionKey)
            .chatBlacklist,
    usersWhitelistProvider: (ctx) =>
        featureProvider.getFeaturesForAction(ctx.botName, ctx.actionKey)
            .userWhitelist
};

const testActionBuilder = new CommandActionBuilderWithState<TestState>(
    'Reaction.Test',
    () => new TestState()
)
    .on('test')
    .withConfiguration(configuration)
    .do(async (ctx, state) => {
        ctx.reply.withText('test response feature off');
    });

export const test = testActionBuilder.build();
