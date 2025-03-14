import ActionStateBase from 'chz-telegram-bot/dist/entities/states/actionStateBase';

export default class PotuzhnoState extends ActionStateBase {
    scoreBoard: Record<string, number> = {};
}
