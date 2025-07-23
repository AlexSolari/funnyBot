import { ActionStateBase } from 'chz-telegram-bot';

export default class NameState extends ActionStateBase {
    lastUsername: Record<number, string> = {};
}
