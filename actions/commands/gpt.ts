import {
    ChatInfo,
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
import { chatAdmins } from '../../types/userIds';
import GptState from '../../state/gptState';
import { getAbortControllerWithTimeout } from '../../helpers/abortControllerWithTimeout';
import { CommandBuilderWithState } from '../../helpers/commandBuilder';
import { getObservability } from '../../helpers/getObservability';
import { EventType } from '../../types/customEvents';
import { ObservabilityHelper } from '../../types/observabilityHelper';

const client = new OpenAI({
    apiKey: openAiToken.token
});

const YOU = 'You (ChatGPT)';

async function getReplyText(
    text: string,
    chatInfo: ChatInfo,
    promt: string,
    observability: ObservabilityHelper,
    messageHistory?: { from: string; message: string }[]
) {
    const historyFromChatInfo = chatInfo.messageHistory.map((x) => ({
        from: x.from?.username ?? x.from?.first_name,
        message: x.text
    }));

    const endpoint = 'openai/responses';

    try {
        observability.emitter.emit(EventType.requestStart, {
            traceId: observability.traceId,
            endpoint
        });

        const messages = messageHistory ?? historyFromChatInfo;
        const discussion = messages.map(
            (x) => `{ user: "${x.from}", message: "${x.message}" }`
        );

        return await client.responses.create({
            model: 'gpt-5',
            input: `${promt}\nHere's chat history before the message so you now have a context of a discussion:\n\n[${discussion.join(
                '\n'
            )}]\n\n
            Here's the message you need to reply:\n${text}`
        });
    } finally {
        observability.emitter.emit(EventType.requestEnd, {
            traceId: observability.traceId,
            endpoint
        });
    }
}

export const gpt = new CommandBuilderWithState('Reaction.Gpt', GptState)
    .on(MessageType.Text)
    .when(
        (ctx, state) =>
            ctx.userInfo.id != null &&
            Math.random() < 0.05 &&
            !chatAdmins.includes(ctx.userInfo.id) &&
            ctx.userInfo.id != state.lastUserId
    )
    .do(async (ctx, state) => {
        state.lastUserId = ctx.userInfo.id!;

        const conversation = [
            { from: ctx.userInfo.name, message: ctx.messageInfo.text }
        ];
        const response = await getReplyText(
            ctx.messageInfo.text,
            ctx.chatInfo,
            `Write a response to following message, be edgy and funny. 
            If possible make a MTG reference relevant to the message contents, but be sure to not overdo it.
            MTG reference should make sence in context of reply itself and chat history.
            Reply language should be Ukraininan. Make sure that reply is short, 75 words max.`,
            getObservability(ctx)
        );

        conversation.push({ from: YOU, message: response.output_text });

        const postSendOperationController = ctx.reply.withText(
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
            conversation.push({
                from: replyCtx.userInfo.name,
                message: replyCtx.messageInfo.text
            });
            const response = await getReplyText(
                replyCtx.messageInfo.text,
                replyCtx.chatInfo,
                `Write a response to following message.
                Make sure that reply makes sence in a context of a discussion.
                Reply language should be Ukraininan. Make sure that reply is short, 75 words max.`,
                getObservability(replyCtx),
                conversation
            );
            conversation.push({ from: YOU, message: response.output_text });

            const postSendOperationController = replyCtx.reply.withText(
                escapeMarkdown(response.output_text)
            );
            postSendOperationController.captureReplies(
                [MessageType.Text],
                replyHandler,
                controller
            );
            timer.refresh();
        };

        postSendOperationController.captureReplies(
            [MessageType.Text],
            replyHandler,
            controller
        );

        if (ctx.chatInfo.id == ChatId.LvivChat)
            ctx.startCustomCooldown(hoursToSeconds(20 as Hours));
    })
    .withRatelimit(1)
    .build();
