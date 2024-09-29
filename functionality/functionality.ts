import CommandAction from '../entities/actions/commandAction';
import ScheduledAction from '../entities/actions/scheduledAction';
import scheduled from './gen_scheduled';
import commands from './gen_commands';
import IActionState from '../types/actionState';

interface IFunctionalityData{
    commands: CommandAction<IActionState>[];
    scheduled: ScheduledAction[];
}

export default {
    commands,
    scheduled
} as IFunctionalityData;