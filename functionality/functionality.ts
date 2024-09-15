import Command from '../entities/actions/command';
import Trigger from '../entities/actions/trigger';
import { IActionState } from '../entities/states/actionStateBase';
import triggers from './gen_triggers';
import commands from './gen_commands';

interface IFunctionalityData{
    commands: Command<IActionState>[];
    triggers: Trigger[];
}

export default {
    commands,
    triggers
} as IFunctionalityData;