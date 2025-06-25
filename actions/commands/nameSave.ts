import { CommandActionBuilderWithState, MessageType } from 'chz-telegram-bot';
import NameState from '../../entities/nameState';

export default new CommandActionBuilderWithState(
    'Reaction.NameSave',
    () => new NameState()
)
    .on(MessageType.Text)
    .when(
        (ctx, state) => state.lastUsername[ctx.fromUserId!] != ctx.fromUserName
    )
    .do(async (ctx, state) => {
        state.lastUsername[ctx.fromUserId!] = ctx.fromUserName;
    })
    .build();
