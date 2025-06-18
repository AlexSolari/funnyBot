import { CommandActionBuilder } from 'chz-telegram-bot';
import { ChatId } from '../../types/chatIds';
import { MtgCardSearchService } from '../../services/cardSearchService';
import escapeMarkdown from '../../helpers/escapeMarkdown';

const TELEGRAM_MAX_MESSAGE_LENGTH = 3000;
const SET_AND_NUMBER_REGEX = /(\w{3,5})\s(\d+)/gi;

export default new CommandActionBuilder('Reaction.CardSearch_Small')
    .on(/\[([^[]+)\]/gi)
    .do(async (ctx) => {
        for (const matchResult of ctx.matchResults) {
            const firstRegexMatch = matchResult[1];

            SET_AND_NUMBER_REGEX.lastIndex = 0;
            const setAndNumberMatch =
                SET_AND_NUMBER_REGEX.exec(firstRegexMatch);
            if (setAndNumberMatch) {
                const message = await MtgCardSearchService.findBySetAndNumber(
                    setAndNumberMatch[1],
                    parseInt(setAndNumberMatch[2])
                );

                if (message) ctx.reply.withText(message);

                continue;
            }

            let message = await MtgCardSearchService.findForAction(
                firstRegexMatch
            );

            if (!message) return;

            if (message.length > TELEGRAM_MAX_MESSAGE_LENGTH) {
                while (message.length > TELEGRAM_MAX_MESSAGE_LENGTH) {
                    const lastNewLineIndex = message.lastIndexOf(
                        '\n\n',
                        TELEGRAM_MAX_MESSAGE_LENGTH
                    );

                    if (
                        lastNewLineIndex !== -1 &&
                        lastNewLineIndex < TELEGRAM_MAX_MESSAGE_LENGTH
                    ) {
                        const chunk = message.slice(0, lastNewLineIndex);
                        message = message.slice(lastNewLineIndex + 2);

                        ctx.reply.andQuote.withText(chunk);
                    }
                }
            } else {
                ctx.reply.andQuote.withText(message);
            }
        }
    })
    .withHelp(
        (botUsername) =>
            'Бот може здійснювати *пошук карток*\\.\n' +
            'Для цього використовуйте наступний синтаксис: *\\[_назва картки_\\]*\\. Також після назви картки, через символ _\\#_ можна задати додаткові аргументи використовуючи синтаксис Scryfall\\. Наприклад: *\\[opt\\#set\\=dom\\]* знайде Opt із сету Dominaria\n\n' +
            'Також доступні наступні флаги для отримання дотаткових даних:\n' +
            ' \\- _price_ \\- покаже ціну по TCGPlayer\n' +
            ' \\- _bans_ \\- покаже бани картки у форматах\n' +
            ' \\- _rules_ \\- покаже рулінги картки\n' +
            ' \\- _flip_ \\- покаже другу сторону, якщо картка двухстороння\n\n' +
            'Приклад використання флагів: *\\[thoughtseize\\#price rules\\]* виведе картку з ціною та рулінгами\n\n' +
            'Пошук карток також доступен через inline\\-query, для чього потрібно у повідомленні набрати тег бота через @, та через пробіл ввести назву картки\\.\n' +
            'Флаги також працюють у цьому режимі, але синтаксис трохи інший: флаги потрібно вказати до назви картки, кожен флаг повинен починатися з \\#\\. Наприклад:\n' +
            `@${escapeMarkdown(botUsername)} \\#rules \\#price consider\n\n` +
            'Також бот може шукати картки за сетом та номером, для цього використовуйте синтаксис *\\[код\\_сету номер\\]*, наприклад: *\\[dom 101\\]* знайде картку з сету Dominaria під номером 101 \\(Rat Colony\\)\\.\n\n'
    )
    .ignoreChat(ChatId.GenshinChat)
    .build();
