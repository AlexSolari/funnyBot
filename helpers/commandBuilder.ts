import {
    ActionStateBase,
    CommandActionBuilderWithState,
    IActionState
} from 'chz-telegram-bot';
import { configuration } from './getFeatures';

export class CommandBuilderWithState<
    TState extends IActionState = ActionStateBase
> extends CommandActionBuilderWithState<TState> {
    constructor(name: string, stateConstructor: new () => TState) {
        super(name, () => new stateConstructor());

        this.withConfiguration(configuration);
    }
}

export class CommandBuilder extends CommandBuilderWithState<ActionStateBase> {
    constructor(name: string) {
        super(name, ActionStateBase);
    }
}
