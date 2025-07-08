import { CommandActionBuilder, MessageType, Seconds } from 'chz-telegram-bot';
import OpenAI from 'openai';
import escapeMarkdown from '../../helpers/escapeMarkdown';
import { ChatId } from '../../types/chatIds';
import openAiToken from '../../openAiToken.json';
import { randomInt } from 'crypto';

const client = new OpenAI({
    apiKey: openAiToken.token
});

export default new CommandActionBuilder('Reaction.Gpt')
    .on(MessageType.Text)
    .when((_) => randomInt(0, 20) == 0)
    .do(async (ctx) => {
        const response = await client.responses.create({
            model: 'gpt-4.1',
            input: `Write a response to following message, be edgy and funny. If possible make an MTG reference relevant to the message contents. \n\n${ctx.messageText}`
        });
        ctx.reply.withText(escapeMarkdown(response.output_text));
    })
    .cooldown(30 as Seconds)
    .ignoreChat(ChatId.PauperChat)
    .build();
