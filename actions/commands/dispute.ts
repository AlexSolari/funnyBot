import { load } from 'cheerio';
import { randomInt } from '../../helpers/randomInt';
import { CommandBuilder } from '../../helpers/commandBuilder';
import { traceFetch } from '../../helpers/fetchWithObservability';
import { getObservability } from '../../helpers/getObservability';
import { ActionStateBase, MessageContext } from 'chz-telegram-bot';

export const dispute = new CommandBuilder('Reaction.Dispute')
    .on([/mtggoldfish\.com\/deck\/(\d+)/i, /mtgdecks\.net\/\S+/i])
    .do(async (ctx) => {
        const cards = await getDecklistFromUrl(ctx);

        const has = (...names: string[]) =>
            names.every((name) => cards.includes(name));
        const basics = BASIC_LANDS.filter((land) => cards.includes(land));

        const rule = rules.find((r) => r.when(has, basics));

        if (rule) {
            rule.reply(ctx);
        } else if (randomInt(0, 1) == 0) {
            ctx.reply.withReaction('🍌');
        }
    })
    .build();

const BASIC_LANDS = ['Plains', 'Island', 'Swamp', 'Mountain', 'Forest'];

type Rule = {
    when: (has: (...names: string[]) => boolean, basics: string[]) => boolean;
    reply: (ctx: MessageContext<ActionStateBase>) => void;
};

const text = (message: string) => (ctx: MessageContext<ActionStateBase>) =>
    ctx.reply.withText(message);

const rules: Rule[] = [
    {
        when: (_, basics) =>
            basics.length == 2 &&
            basics.includes('Mountain') &&
            basics.includes('Swamp'),
        reply: text('ми досі про ракдос дрочню?')
    },
    {
        when: (has) => has('Fanatical Offering'),
        reply: (ctx) => ctx.reply.withImage('offering')
    },
    {
        when: (has) => has('Myr Enforcer'),
        reply: text('ВААААУ! вперше бачу такий набір карт. автор геній!')
    },
    {
        when: (has) => has("Urza's Tower", 'Ghostly Flicker'),
        reply: text(
            'о, трон. всі встигнуть сходити по пиво, поки ти зробиш перший хід'
        )
    },
    {
        when: (has) => has("Moment's Peace"),
        reply: text('мене вже клонить у сон від одного декліста')
    },
    {
        when: (has) => has('Slippery Bogle') || has('Ethereal Armor'),
        reply: text('одна жаба, сім аур і жодного плану проти Edict')
    },
    {
        when: (has) => has('Llanowar Elves', 'Priest of Titania'),
        reply: text('ельфи? Electrickery вже виїхала')
    },
    {
        when: (has) => has('Spellstutter Sprite'),
        reply: text('граєш у меджик так, щоб ніхто інший не грав')
    },
    {
        when: (has) => has('Tolarian Terror'),
        reply: text('знову ця змія за одну ману. оригінально')
    },
    {
        when: (has) => has('Gurmag Angler'),
        reply: text('риба знову в меню')
    },
    {
        when: (has) => has('Lightning Bolt', 'Fireblast'),
        reply: text('дека для тих, хто вміє рахувати тільки від 20 до нуля')
    },
    {
        when: (has) => has('Kuldotha Rebirth'),
        reply: text('гобліни з артефактів. дуже лорно')
    },
    {
        when: (has) => has('Atog'),
        reply: text('Атог голодний, а ти без друзів')
    },
    {
        when: (has) => has('Chittering Rats'),
        reply: text('щури. дуже символічно')
    },
    {
        when: (has) => has('Basilisk Gate'),
        reply: text('ворота, ворота, ворота... тобі не набридло?')
    },
    {
        when: (has) => has('Quirion Ranger', 'Nettle Sentinel'),
        reply: text('ліс, ліс, мавпа, ліс')
    },
    {
        when: (has) => has('Guardian of the Guildpact'),
        reply: text('протекція від усього, включно з друзями')
    },
    {
        when: (has) => has('Axebane Guardian'),
        reply: text('будуємо стіну. мексика заплатить')
    },
    {
        when: (_, basics) => basics.length == 5,
        reply: text("п'ять кольорів і нуль плану")
    },
    {
        when: (_, basics) => basics.length == 1,
        reply: text('один колір, одна клітинка мозку')
    }
];

async function getDecklistFromUrl(ctx: MessageContext<ActionStateBase>) {
    const isMtggoldfish = ctx.matchResults[0][0].includes('mtggoldfish.com');

    if (isMtggoldfish) {
        const deckId = ctx.matchResults[0][1];
        const response = await traceFetch(
            `https://www.mtggoldfish.com/deck/arena_download/${deckId}`,
            getObservability(ctx)
        );
        const text = await response.text();
        const $ = load(text);

        return $('.copy-paste-box').text();
    }

    const link = ctx.matchResults[0][0];
    const response = await traceFetch(`https://${link}`, getObservability(ctx));
    const text = await response.text();
    const $ = load(text);

    return $('tr.cardItem a')
        .toArray()
        .map((el) => $(el).text())
        .join('\n');
}
