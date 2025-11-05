import { MessageType } from "chz-telegram-bot";
import { CommandBuilder } from "../../helpers/commandBuilder";
import escapeMarkdown from "../../helpers/escapeMarkdown";

export const discussion = new CommandBuilder("Reaction.Discussion")
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
      if (!message.from) continue;

      const username = message.from.username
        ? message.from.username
        : message.from.first_name
        ? message.from.first_name +
          (message.from.last_name ? " " + message.from.last_name : "")
        : null;

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
        `Ого, @${topUsername}, бачу тобі явно було що сказати! \n\nДякую за цікаву дискусію!`
      )
    );
  })
  .build();
