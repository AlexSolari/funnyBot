import { MessageType } from 'chz-telegram-bot';
import { CommandBuilder } from '../../helpers/commandBuilder';
import escapeMarkdown from '../../helpers/escapeMarkdown';
import { ChatHistoryMessage } from 'chz-telegram-bot/dist/dtos/chatHistoryMessage';

export const discussion = new CommandBuilder('Reaction.Discussion')
    .on(MessageType.Any)
    .when(
        (ctx, _) =>
            ctx.chatInfo.messageHistory.length == 100 &&
            ctx.chatInfo.messageHistory[99].date -
                ctx.chatInfo.messageHistory[0].date <=
                60 * 5 // 5 minutes
    )
    .do(async (ctx, _) => {
        const userMessageCount: Record<string, number> = {};
        for (const message of ctx.chatInfo.messageHistory) {
            const username = genUsername(message);

            if (!username) continue;

            if (!userMessageCount[username]) userMessageCount[username] = 0;
            userMessageCount[username]++;
        }

        const sortedUsers = Object.entries(userMessageCount).sort(
            (a, b) => b[1] - a[1]
        );
        const topUsername = sortedUsers[0][0];

        ctx.reply.withText(
            escapeMarkdown(
                `Ого, ${topUsername}, бачу тобі явно було що сказати! \n\nДякую за цікаву дискусію!`
            )
        );
    })
    .build();

function genUsername(message: ChatHistoryMessage) {
    if (!message.from) return null;

    if (message.from.username) return `@${message.from.username}`;

    if (message.from.first_name && message.from.last_name)
        return `${message.from.first_name} ${message.from.last_name}`;

    if (message.from.first_name) return message.from.first_name;

    return null;
}
