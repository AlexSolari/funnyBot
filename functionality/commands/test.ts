/* eslint-disable @typescript-eslint/no-unused-vars */
import { CommandActionBuilder } from 'chz-telegram-bot';
import { ChatId } from '../../types/chatIds';

export default new CommandActionBuilder('Reaction.Test')
    .on('test')
    .when(async (ctx) => ctx.chatId == ChatId.TestChat)
    .do(async (ctx) => {})
    .disabled()
    .build();
