import { CommandActionBuilder, Hours, hoursToSeconds } from 'chz-telegram-bot';
import { ChatId } from '../../../types/chatIds';
import { randomInt } from '../../../helpers/randomInt';

export default new CommandActionBuilder('Reaction.Ring')
    .on(/кольц/i)
    .do(async (ctx) => {
        const seed = randomInt(0, 2);

        switch (seed) {
            case 0:
                ctx.reply.withText(
                    `https://aliexpress.com/popular/%D0%B0%D0%BD%D0%B0%D0%BB%D1%8C%D0%BD%D0%BE%D0%B5-%D0%BA%D0%BE%D0%BB%D1%8C%D1%86%D0%BE-%D0%BC%D0%B5%D1%82%D0%B0%D0%BB%D0%BB.html`
                );
                break;
            case 1:
                ctx.reply.withText(
                    `https://ukrferma.com.ua/ru/kiltse-zapobigaie-samodoenie/?gclid=CjwKCAjw_aemBhBLEiwAT98FMiHpI0K3opX64qjVEZsBDayL3JisMGy2LEf7kZkEuOZGF_lmtHoCtxoCackQAvD_BwE`
                );
                break;
            default:
                ctx.reply.withText('🤓');
                break;
        }
    })
    .cooldown(hoursToSeconds(2 as Hours))
    .disabled()
    .ignoreChat(ChatId.LvivChat)
    .ignoreChat(ChatId.PauperChat)
    .ignoreChat(ChatId.FrankivskChat)
    .ignoreChat(ChatId.FnmChat)
    .ignoreChat(ChatId.GenshinChat)
    .build();
