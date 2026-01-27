import { Hours, hoursToSeconds, TelegramMessage } from 'chz-telegram-bot';
import OpenAI from 'openai';
import escapeMarkdown from '../../helpers/escapeMarkdown';
import { ChatId } from '../../types/chatIds';
import openAiToken from '../../openAiToken.json';
import { CommandBuilder } from '../../helpers/commandBuilder';

const client = new OpenAI({
    apiKey: openAiToken.token
});

function getTextContentsFromReply(messageUpdateObject: TelegramMessage) {
    if (
        'reply_to_message' in messageUpdateObject &&
        messageUpdateObject.reply_to_message
    ) {
        if ('text' in messageUpdateObject.reply_to_message)
            return messageUpdateObject.reply_to_message.text ?? '';

        if ('caption' in messageUpdateObject.reply_to_message)
            return messageUpdateObject.reply_to_message.caption ?? '';
    }

    return '';
}

export const gptIsTrue = new CommandBuilder('Reaction.Gpt_IsTrue')
    .on(/is (this|it|that) true\??/gi)
    .when(
        (ctx) =>
            getTextContentsFromReply(ctx.messageInfo.telegramUpdateObject)
                .length > 0
    )
    .do(async (ctx) => {
        const query = getTextContentsFromReply(
            ctx.messageInfo.telegramUpdateObject
        );
        const index = ctx.chatInfo.messageHistory.findIndex(
            (x) => x.text == query
        );
        const messagesBeforeTarget = ctx.chatInfo.messageHistory
            .filter((_, i) => i <= index)
            .map((x) => `${x.from?.username ?? x.from?.first_name}: ${x.text}`);

        const input = `Analyze following message, is it factual and/or truthful, write a response to it. 
            If needed, cite sources. Be professional. Reply language should be Ukraininan and shoud not containt Markdown syntax, but can contain links. 
            Here's chat history before the message so you now have a context of a discussion:\n\n[${messagesBeforeTarget.join(
                ', '
            )}]\n\n
            Here's the message you need to reply:\n\n${query}`;
        const response = await client.responses.create({
            model: 'gpt-5',
            input
        });
        ctx.reply.withText(escapeMarkdown(response.output_text));

        if (ctx.chatInfo.id == ChatId.LvivChat)
            ctx.startCustomCooldown(hoursToSeconds(4 as Hours));
    })
    .withRatelimit(1)
    .build();
