import { MessageInfo, MessageType } from 'chz-telegram-bot';
import { CommandBuilder } from '../../helpers/commandBuilder';

const DVACH_CHATIDS = new Set([
    -1001009232144, -1001166834860, -1001660509596, -1001148195583
]);
const DVACH_LIGHTNING_ID = '5359617799515823946';

function isForwarded(messageInfo: MessageInfo) {
    const update = messageInfo.telegramUpdateObject;
    const isForward = 'forward_origin' in update;

    if (isForward && update.forward_origin?.type == 'channel') {
        return DVACH_CHATIDS.has(update.forward_origin.chat.id);
    }

    return false;
}

function hasEmoji(messageInfo: MessageInfo) {
    const update = messageInfo.telegramUpdateObject;

    if ('entities' in update) {
        return (
            update.entities?.find(
                (x) =>
                    x.type == 'custom_emoji' &&
                    x.custom_emoji_id == DVACH_LIGHTNING_ID
            ) != undefined
        );
    }

    return false;
}

function hasVideo(messageInfo: MessageInfo) {
    const update = messageInfo.telegramUpdateObject;

    const hasVideo = 'video' in update && update.video != undefined;

    if (hasVideo && 'file_name' in update.video) {
        const videoName = update.video.file_name ?? '';

        return (
            videoName.includes('dvach') ||
            videoName.includes('Двач') ||
            videoName.includes('2ch')
        );
    }

    return false;
}

export const dvach = new CommandBuilder('Reaction.Dvach')
    .on(MessageType.Any)
    .when(
        (ctx) =>
            isForwarded(ctx.messageInfo) ||
            hasVideo(ctx.messageInfo) ||
            hasEmoji(ctx.messageInfo)
    )
    .do(async (ctx) => {
        ctx.reply.withImage('dvach');
    })
    .build();
