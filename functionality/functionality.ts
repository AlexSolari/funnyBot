import scheduled from './gen_scheduled';
import commands from './gen_commands';
import { IActionState } from 'chz-telegram-bot';
import { CommandAction } from 'chz-telegram-bot/dist/entities/actions/commandAction';
import { ScheduledAction } from 'chz-telegram-bot/dist/entities/actions/scheduledAction';

interface IFunctionalityData {
    commands: CommandAction<IActionState>[];
    scheduled: ScheduledAction[];
}

export default {
    commands,
    scheduled
} as IFunctionalityData;
