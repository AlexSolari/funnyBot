import IActionState from "../types/actionState";

export default class TransactionResult{
    data: IActionState;
    shouldUpdate: boolean;

    constructor(data: IActionState, shouldUpdate: boolean){
        this.data = data;
        this.shouldUpdate = shouldUpdate;
    }
}