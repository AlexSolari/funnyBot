import IActionState from "./actionState";

export default interface IActionWithState {
    key: string;
    stateConstructor: () => IActionState;
}