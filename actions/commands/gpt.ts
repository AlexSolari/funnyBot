import { CommandActionBuilder, Hours, MessageType } from 'chz-telegram-bot';
import OpenAI from 'openai';
import escapeMarkdown from '../../helpers/escapeMarkdown';
import { ChatId } from '../../types/chatIds';
import openAiToken from '../../openAiToken.json';
import { SpecificUsers } from '../../types/userIds';
import { hoursToSeconds } from 'chz-telegram-bot/dist/helpers/timeConvertions';

const whitelist = [SpecificUsers.nerdik, SpecificUsers.otabapa];
const client = new OpenAI({
    apiKey: openAiToken.token
});

export default new CommandActionBuilder('Reaction.Gpt')
    .on(MessageType.Text)
    .when((ctx) => Math.random() < 0.05 && !whitelist.includes(ctx.fromUserId!))
    .do(async (ctx) => {
        const response = await client.responses.create({
            model: 'gpt-4.1',
            input: `Write a response to following message, be edgy and funny. If possible make a MTG reference relevant to the message contents. Make sure that reply is short, 50 words max. \n\n${ctx.messageText}`
        });
        ctx.reply.withText(escapeMarkdown(response.output_text));
    })
    .ratelimit(1)
    .cooldown(hoursToSeconds(8 as Hours))
    .ignoreChat(ChatId.PauperChat)
    .build();
