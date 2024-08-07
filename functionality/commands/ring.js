import CommandBuilder from '../../helpers/builders/commandBuilder.js';
import randomInteger from '../../helpers/randomInt.js';
import { lvivChat } from '../../helpers/chatIds.js';

export default new CommandBuilder("Reaction.Ring")
    .on(/кольц/i)
    .do((ctx) => {
        const seed = randomInteger(0, 2);

        switch (seed) {
            case 0:
                ctx.replyWithText(`https://aliexpress.com/popular/%D0%B0%D0%BD%D0%B0%D0%BB%D1%8C%D0%BD%D0%BE%D0%B5-%D0%BA%D0%BE%D0%BB%D1%8C%D1%86%D0%BE-%D0%BC%D0%B5%D1%82%D0%B0%D0%BB%D0%BB.html`);
                break;
            case 1:
                ctx.replyWithText(`https://ukrferma.com.ua/ru/kiltse-zapobigaie-samodoenie/?gclid=CjwKCAjw_aemBhBLEiwAT98FMiHpI0K3opX64qjVEZsBDayL3JisMGy2LEf7kZkEuOZGF_lmtHoCtxoCackQAvD_BwE`);
                break;
            default:
                ctx.replyWithText("🤓");
                break;
        }
    })
    .cooldown(7200)
    .disabled()
    .ignoreChat(lvivChat)
    .build();