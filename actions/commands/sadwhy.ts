import { CommandActionBuilder, Milliseconds } from 'chz-telegram-bot';
import { randomInt } from '../../helpers/randomInt';
import escapeMarkdown from '../../helpers/escapeMarkdown';
import { featureSetConfiguration } from '../../helpers/getFeatures';

export const sadwhy = new CommandActionBuilder('Reaction.SadWhy')
    .on(/железяка/i)
    .do(async (ctx) => {
        const isDerogatory =
            ctx.messageInfo.text.includes('нахуй') ||
            ctx.messageInfo.text.includes('йобана') ||
            ctx.messageInfo.text.includes('єбан') ||
            ctx.messageInfo.text.includes('іді');

        if (isDerogatory) {
            ctx.wait(2000 as Milliseconds);
            switch (randomInt(0, 3)) {
                case 0:
                    ctx.reply.withText(escapeMarkdown('добре, вибач...'));
                    break;
                case 1:
                    ctx.reply.withText(
                        escapeMarkdown(
                            'вибач бумласка я просто хотів розрядити обстановку.....'
                        )
                    );
                    break;
                case 2:
                    ctx.reply.withImage('sadcat');
                    break;
                case 3:
                    ctx.reply.withReaction('😭');
                    break;
            }
        }
    })
    .withConfiguration(() => featureSetConfiguration)
    .build();
