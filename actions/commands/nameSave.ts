import { MessageType } from 'chz-telegram-bot';
import NameState from '../../state/nameState';
import { CommandBuilderWithState } from '../../helpers/commandBuilder';

export const nameSave = new CommandBuilderWithState(
    'Reaction.NameSave',
    NameState
)
    .on(MessageType.Any)
    .when(
        (ctx, state) =>
            ctx.userInfo.id != null &&
            (state.lastUsername[ctx.userInfo.id] != ctx.userInfo.name ||
                state.lastUsertag[ctx.userInfo.id] != ctx.userInfo.usertag)
    )

    .do(async (ctx, state) => {
        state.lastUsername[ctx.userInfo.id!] = ctx.userInfo.name;
        state.lastUsertag[ctx.userInfo.id!] = ctx.userInfo.usertag;
    })
    .build();
