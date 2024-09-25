import CommandAction from '../entities/actions/commandAction';
import ScheduledAction from '../entities/actions/scheduledAction';
import { IActionState } from '../entities/states/actionStateBase';
import scheduled from './gen_scheduled';
import commands from './gen_commands';

interface IFunctionalityData{
    commands: CommandAction<IActionState>[];
    scheduled: ScheduledAction[];
}

export default {
    commands,
    scheduled
} as IFunctionalityData;