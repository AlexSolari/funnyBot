import { ActionStateBase } from 'chz-telegram-bot';

export default class PotuzhnoState extends ActionStateBase {
    scoreBoard: Record<string, number> = {};
    superCharge: number = 1;
}
