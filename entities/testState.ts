/* eslint-disable @typescript-eslint/no-explicit-any */
import { ActionStateBase } from 'chz-telegram-bot';

export default class TestState extends ActionStateBase {
    data: Record<string, any> = {};
}
