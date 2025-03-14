import scheduled from './gen_scheduled';
import commands from './gen_commands';
import CommandAction from 'chz-telegram-bot/dist/entities/actions/commandAction';
import ScheduledAction from 'chz-telegram-bot/dist/entities/actions/scheduledAction';
import IActionState from 'chz-telegram-bot/dist/types/actionState';

interface IFunctionalityData {
    commands: CommandAction<IActionState>[];
    scheduled: ScheduledAction[];
}

export default {
    commands,
    scheduled
} as IFunctionalityData;
