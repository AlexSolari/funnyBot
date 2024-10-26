import IActionState from '../../types/actionState';

export default class ActionStateBase implements IActionState {
    lastExecutedDate = 0;
}
