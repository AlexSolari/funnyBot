import { CommandActionProvidersConfiguration } from 'chz-telegram-bot';
import { featureProvider } from '../services/featureProvider';

export const configuration: CommandActionProvidersConfiguration = {
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
