import ActionState from "./actionState.js";

export default class TransactionResult{
    /**
     * 
     * @param {ActionState} data 
     * @param {boolean} shouldUpdate 
     */
    constructor(data, shouldUpdate){
        this.data = data;
        this.shouldUpdate = shouldUpdate;
    }
}