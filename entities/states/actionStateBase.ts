export interface IActionState{
    lastExecutedDate: number;
}

export class ActionStateBase implements IActionState{
    lastExecutedDate = 0;
}