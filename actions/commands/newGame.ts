import { CommandBuilder } from '../../helpers/commandBuilder';
import { mtgrdleService } from '../../services/mtgrdleService';

export const newGame = new CommandBuilder('Reaction.NewGame')
    .on('/newgame')
    .when((ctx) => ctx.chatInfo.name == 'DM')
    .do(async (ctx) => {
        await mtgrdleService.startGame(ctx);
    })
    .build();
