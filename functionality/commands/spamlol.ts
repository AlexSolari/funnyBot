import { CommandActionBuilder, MessageType, Seconds } from 'chz-telegram-bot';
import { ChatId } from '../../types/chatIds';
import { SpecificUsers } from '../../types/userIds';

export default new CommandActionBuilder('Reaction.Spamlol')
    .on(MessageType.NewChatMember)
    .from(SpecificUsers.m_1kyyqq)
    .when(async (ctx) => ctx.chatId == ChatId.LvivChat)
    .do(async (ctx) => {
        ctx.replyWithImage('spam');
    })
    .cooldown(0 as Seconds)
    .build();
