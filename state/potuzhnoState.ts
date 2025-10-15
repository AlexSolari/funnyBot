import { ActionStateBase } from 'chz-telegram-bot';

export default class PotuzhnoState extends ActionStateBase {
    static readonly superChargeMultiplier = 15;

    scoreBoard: Record<string, number> = {};
    idScoreBoard: Record<number, number> = {};
    superCharge: number = 1;
}
