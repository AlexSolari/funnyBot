import { CommandActionBuilderWithState, MessageType } from 'chz-telegram-bot';
import NameState from '../../state/nameState';

export const nameSave = new CommandActionBuilderWithState(
    'Reaction.NameSave',
    () => new NameState()
)
    .on(MessageType.Any)
    .when(
        (ctx, state) => state.lastUsername[ctx.userInfo.id] != ctx.userInfo.name
    )
    .do(async (ctx, state) => {
        state.lastUsername[ctx.userInfo.id] = ctx.userInfo.name;
    })
    .build();
