import { ActionStateBase } from 'chz-telegram-bot';

export default class SpamState extends ActionStateBase {
    count: number;

    constructor(count: number) {
        super();
        this.count = count;
    }
}
