/** @import ActionStateBase from "./states/actionStateBase.js"; */

export default class TransactionResult{
    /**
     * 
     * @param {ActionStateBase} data 
     * @param {boolean} shouldUpdate 
     */
    constructor(data, shouldUpdate){
        this.data = data;
        this.shouldUpdate = shouldUpdate;
    }
}