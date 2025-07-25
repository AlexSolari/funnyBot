import {
    ChatInfo,
    CommandActionBuilderWithState,
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
import GptState from '../../state/gptState';
import { getAbortControllerWithTimeout } from '../../helpers/abortControllerWithTimeout';
import { configuration } from '../../helpers/getFeatures';

const whitelist = [SpecificUsers.nerdik, SpecificUsers.otabapa];
const client = new OpenAI({
    apiKey: openAiToken.token
});

async function getReplyText(
    text: string,
    chatInfo: ChatInfo,
    promt: string,
    messageHistory?: string[]
) {
    const index = chatInfo.messageHistory.findIndex((x) => x.text == text);
    const messagesBeforeTarget = chatInfo.messageHistory
        .filter((_, i) => i <= index)
        .map((x) => `${x.from?.username}: ${x.text}`);

    const response = await client.responses.create({
        model: 'gpt-4.1',
        input: `${promt} 
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
    .when(
        (ctx, state) =>
            Math.random() < 0.05 &&
            !whitelist.includes(ctx.userInfo.id) &&
            ctx.userInfo.id != state.lastUserId
    )
    .do(async (ctx, state) => {
        state.lastUserId = ctx.userInfo.id!;

        const conversation = [`${ctx.userInfo.name}: ${ctx.messageInfo.text}`];
        const response = await getReplyText(
            ctx.messageInfo.text,
            ctx.chatInfo,
            `Write a response to following message, be edgy and funny. 
            If possible make a MTG reference relevant to the message contents, but be sure to not overdo it.
            MTG reference should make sence in context of reply itself and chat history.
            Reply language should be Ukraininan. Make sure that reply is short, 50 words max.`
        );

        conversation.push(`You: ${response.output_text}`);

        const captureController = ctx.reply.withText(
            escapeMarkdown(response.output_text)
        );

        if (
            ctx.chatInfo.id == ChatId.LvivChat ||
            ctx.chatInfo.id == ChatId.FrankivskChat
        )
            return;

        const { controller, timer } = getAbortControllerWithTimeout(
            secondsToMilliseconds(120 as Seconds)
        );
        const replyHandler = async (replyCtx: ReplyContext<IActionState>) => {
            conversation.push(
                `${replyCtx.userInfo.name}: ${replyCtx.messageInfo.text}`
            );
            const response = await getReplyText(
                replyCtx.messageInfo.text,
                replyCtx.chatInfo,
                `Write a response to following message.
                Make sure that reply makes sence in a context of a discussion.
                Reply language should be Ukraininan. Make sure that reply is short, 50 words max.`,
                conversation
            );
            conversation.push(`You: ${response.output_text}`);

            const captureController = replyCtx.reply.withText(
                escapeMarkdown(response.output_text)
            );
            captureController.captureReplies(
                [MessageType.Text],
                replyHandler,
                controller
            );
            timer.refresh();
        };

        captureController.captureReplies(
            [MessageType.Text],
            replyHandler,
            controller
        );
    })
    .withRatelimit(1)
    .withConfiguration(configuration)
    .build();
