import {
    CommandActionBuilderWithState,
    Hours,
    MessageType
} from 'chz-telegram-bot';
import OpenAI from 'openai';
import escapeMarkdown from '../../helpers/escapeMarkdown';
import { ChatId } from '../../types/chatIds';
import openAiToken from '../../openAiToken.json';
import { SpecificUsers } from '../../types/userIds';
import { hoursToSeconds } from 'chz-telegram-bot/dist/helpers/timeConvertions';
import GptState from '../../entities/gptState';

const whitelist = [SpecificUsers.nerdik, SpecificUsers.otabapa];
const client = new OpenAI({
    apiKey: openAiToken.token
});

export default new CommandActionBuilderWithState(
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
        const index = ctx.chatInfo.messageHistory.findIndex(
            (x) => x.text == ctx.messageInfo.text
        );
        const messagesBeforeTarget = ctx.chatInfo.messageHistory
            .filter((_, i) => i <= index)
            .map((x) => `${x.from?.username}: ${x.text}\n`);

        const response = await client.responses.create({
            model: 'gpt-4.1',
            input: `Write a response to following message, be edgy and funny. 
            If possible make a MTG reference relevant to the message contents, but be sure to not overdo it.
            Reply language should be Ukraininan. Make sure that reply is short, 50 words max. 
            Here's chat history before the message so you now have a context of a discussion:\n\n[${messagesBeforeTarget}]
            Here's the message you need to reply:\n\n${ctx.messageInfo.text}`
        });
        ctx.reply.withText(escapeMarkdown(response.output_text));
    })
    .ratelimit(1)
    .cooldown(hoursToSeconds(20 as Hours))
    .ignoreChat(ChatId.PauperChat)
    .build();
