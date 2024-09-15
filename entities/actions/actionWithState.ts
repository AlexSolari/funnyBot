import { IActionState } from "../states/actionStateBase";

export default interface IActionWithState{
    key: string;
    stateConstructor: () => IActionState;
}