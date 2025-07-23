import { ActionStateBase } from 'chz-telegram-bot';

export default class PotuzhnoState extends ActionStateBase {
    static superChargeMultiplier = 15;

    scoreBoard: Record<string, number> = {};
    idScoreBoard: Record<number, number> = {};
    superCharge: number = 1;
}
