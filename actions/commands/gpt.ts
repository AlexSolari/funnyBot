import {
    ChatInfo,
    CommandActionBuilderWithState,
    Hours,
    hoursToSeconds,
    IActionState,
    MessageType,
    ReplyContext,
    Seconds,
    secondsToMilliseconds
} from 'chz-telegram-bot';
import OpenAI from 'openai';
import escapeMarkdown from '../../helpers/escapeMarkdown';
import { ChatId } from '../../types/chatIds';
import openAiToken from '../../openAiToken.json';
import { SpecificUsers } from '../../types/userIds';
import GptState from '../../entities/gptState';

const whitelist = [SpecificUsers.nerdik, SpecificUsers.otabapa];
const client = new OpenAI({
    apiKey: openAiToken.token
});

async function getReplyText(
    text: string,
    chatInfo: ChatInfo,
    messageHistory?: string[]
) {
    const index = chatInfo.messageHistory.findIndex((x) => x.text == text);
    const messagesBeforeTarget = chatInfo.messageHistory
        .filter((_, i) => i <= index)
        .map((x) => `${x.from?.username}: ${x.text}`);

    const response = await client.responses.create({
        model: 'gpt-4.1',
        input: `Write a response to following message, be edgy and funny. 
            If possible make a MTG reference relevant to the message contents, but be sure to not overdo it.
            MTG reference should make sence in context of reply itself and chat history.
            Reply language should be Ukraininan. Make sure that reply is short, 50 words max. 
            Here's chat history before the message so you now have a context of a discussion:\n\n[${(
                messageHistory ?? messagesBeforeTarget
            ).join('\n')}]
            Here's the message you need to reply:\n\n${text}`
    });
    return response;
}

export const gpt = new CommandActionBuilderWithState(
    'Reaction.Gpt',
    () => new GptState()
)
    .on(MessageType.Text)
    .notIn([ChatId.PauperChat])
    .when(
        (ctx, state) =>
            Math.random() < 0.05 &&
            !whitelist.includes(ctx.userInfo.id) &&
            ctx.userInfo.id != state.lastUserId
    )
    .do(async (ctx, state) => {
        const conversation = [`${ctx.userInfo.name}: ${ctx.messageInfo.text}`];
        state.lastUserId = ctx.userInfo.id!;
        const response = await getReplyText(ctx.messageInfo.text, ctx.chatInfo);

        conversation.push(`You: ${response.output_text}`);
        const captureController = ctx.reply.withText(
            escapeMarkdown(response.output_text)
        );

        const abortController = new AbortController();
        const timer = setTimeout(
            () => abortController.abort(),
            secondsToMilliseconds(300 as Seconds)
        );
        const replyHandler = async (replyCtx: ReplyContext<IActionState>) => {
            conversation.push(
                `${replyCtx.userInfo.name}: ${replyCtx.messageInfo.text}`
            );
            const response = await getReplyText(
                replyCtx.messageInfo.text,
                replyCtx.chatInfo,
                conversation
            );
            conversation.push(`You: ${response.output_text}`);

            const captureController = replyCtx.reply.withText(
                escapeMarkdown(response.output_text)
            );
            captureController.captureReplies(
                [MessageType.Text],
                replyHandler,
                abortController
            );
            timer.refresh();
        };
        captureController.captureReplies(
            [MessageType.Text],
            replyHandler,
            abortController
        );
    })
    .withRatelimit(1)
    .withCooldown({ seconds: hoursToSeconds(20 as Hours) })
    .build();
