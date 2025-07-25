import { CommandActionProvidersConfiguration } from 'chz-telegram-bot';
import { ActionKey } from 'chz-telegram-bot/dist/types/action';
import { featureProvider } from '../services/featureProvider';
import { CooldownInfo } from 'chz-telegram-bot/dist/dtos/cooldownInfo';

export const featureSetConfiguration = {
    cooldownProvider: (ctx) => {
        const features = getFeatures(ctx);

        return new CooldownInfo(
            features.cooldownSeconds,
            features.cooldownMessage
        );
    },
    chatsWhitelistProvider: (ctx) => getFeatures(ctx).chatWhitelist,
    isActiveProvider: (ctx) => getFeatures(ctx).active,
    chatsBlacklistProvider: (ctx) => getFeatures(ctx).chatBlacklist,
    usersWhitelistProvider: (ctx) => getFeatures(ctx).userWhitelist
} as CommandActionProvidersConfiguration;

function getFeatures(ctx: { botName: string; actionKey: ActionKey }) {
    return featureProvider.getFeaturesForAction(ctx.botName, ctx.actionKey);
}
