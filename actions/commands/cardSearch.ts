import { ActionStateBase, MessageContext } from 'chz-telegram-bot';
import { MtgCardSearchService } from '../../services/cardSearchService';
import escapeMarkdown from '../../helpers/escapeMarkdown';
import { CommandBuilder } from '../../helpers/commandBuilder';

const TELEGRAM_MAX_MESSAGE_LENGTH = 3000;

function sendInChunks(
    message: string,
    ctx: MessageContext<ActionStateBase>,
    firstRegexMatch: string
) {
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

            ctx.reply.andQuote.withText(chunk, firstRegexMatch);
        }
    }
}

export const cardSearch = new CommandBuilder('Reaction.CardSearch_Small')
    .on(/\[([^[]+)\]/gi)
    .do(async (ctx) => {
        for (const matchResult of ctx.matchResults) {
            const firstRegexMatch = matchResult[1];
            const { message, keyboardData } =
                await MtgCardSearchService.findForAction(firstRegexMatch);

            if (!message) {
                const querySplitResult =
                    MtgCardSearchService.getFlagsFromActionMatchResult(
                        firstRegexMatch
                    );

                ctx.reply.andQuote.withText(
                    `Карток по запиту "${escapeMarkdown(
                        querySplitResult.query
                    )}" не знайдено, будь ласка уточніть назву:`,
                    querySplitResult.query,
                    {
                        keyboard: [
                            [
                                {
                                    text: querySplitResult.query,
                                    switch_inline_query_current_chat:
                                        querySplitResult.query
                                }
                            ]
                        ]
                    }
                );
                continue;
            }

            if (message.length > TELEGRAM_MAX_MESSAGE_LENGTH) {
                sendInChunks(message, ctx, firstRegexMatch);

                continue;
            }

            ctx.reply.andQuote.withText(message, firstRegexMatch, {
                keyboard: keyboardData.map((x) => [
                    {
                        text: x,
                        switch_inline_query_current_chat: x
                    }
                ])
            });
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
    .build();
