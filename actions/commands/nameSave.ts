import { MessageType } from 'chz-telegram-bot';
import NameState from '../../state/nameState';
import { CommandBuilderWithState } from '../../helpers/commandBuilder';

export const nameSave = new CommandBuilderWithState(
    'Reaction.NameSave',
    NameState
)
    .on(MessageType.Any)
    .when(
        (ctx, state) => state.lastUsername[ctx.userInfo.id] != ctx.userInfo.name
    )
    .do(async (ctx, state) => {
        state.lastUsername[ctx.userInfo.id] = ctx.userInfo.name;
    })
    .build();
