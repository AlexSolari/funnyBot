import { IActionState } from "./states/actionStateBase";

export default class TransactionResult{
    data: IActionState;
    shouldUpdate: boolean;

    constructor(data: IActionState, shouldUpdate: boolean){
        this.data = data;
        this.shouldUpdate = shouldUpdate;
    }
}