export const ActionNames = {
    banner: 'banner',
    cardSearch: 'cardSearch',
    dispute: 'dispute',
    dvach: 'dvach',
    fang: 'fang',
    gptIsTrue: 'gptIsTrue',
    gpt: 'gpt',
    hello: 'hello',
    kamaz: 'kamaz',
    long: 'long',
    lotus: 'lotus',
    nameSave: 'nameSave',
    pizda: 'pizda',
    ponyav: 'ponyav',
    potuzhno: 'potuzhno',
    potuzhnoStats: 'potuzhnoStats',
    rating: 'rating',
    registration: 'registration',
    ru: 'ru',
    sadwhy: 'sadwhy',
    slon: 'slon',
    ternopil: 'ternopil',
    test: 'test',
    vitalii: 'vitalii',
    voice: 'voice',
    discussion: 'discussion',
    spellcoins: 'spellcoins'
} as const;

export type ActionName = (typeof ActionNames)[keyof typeof ActionNames];

export const actionDescriptions: Record<ActionName, string> = {
    [ActionNames.banner]:
        'Надає актуальну інформацію про поточні та майбутні банери в Genshin Impact',
    [ActionNames.cardSearch]: 'Пошук карток через Scryfall API',
    [ActionNames.dispute]:
        'Аналізує деклісти з MTGGoldfish та надає гумористичні коментарі',
    [ActionNames.dvach]: 'Посилає нахуй за репост з двачу',
    [ActionNames.fang]:
        'Реагує тематичними картинками коли в чаті згадують слова "фанг" або "мотомиш"',
    [ActionNames.gptIsTrue]: 'GROK IS THIS TRUE',
    [ActionNames.gpt]:
        'Використовує ШІ для генерації контекстуальних відповідей на випадкові повідомлення',
    [ActionNames.hello]:
        'Автоматично відповідає "hello" коли хтось пише "нi" в чаті',
    [ActionNames.kamaz]:
        'Автоматично ділиться тематичною картинкою коли згадують "камаз"',
    [ActionNames.long]:
        'Виявляє надмірно довгі повідомлення та реагує картинкою',
    [ActionNames.lotus]:
        'Публікує картинки зі дампінг сферою у відповідь на згадки про "лотос"',
    [ActionNames.nameSave]:
        'Фоновий сервіс, що зберігає останні нікнейми користувачів',
    [ActionNames.pizda]: 'Відповідає "пізда" на повідомлення "да"',
    [ActionNames.ponyav]:
        'Відповідає жартом "в штани намоняв" коли хтось пише "поняв"',
    [ActionNames.potuzhno]:
        'Випадковим чином реагує "Потужно" на повідомлення та веде рахунок активності користувачів',
    [ActionNames.potuzhnoStats]:
        'Показує топ-10 учасників чату за рейтингом "потужності"',
    [ActionNames.rating]: 'Рандомно відповідає на посилання на ютуб відео.',
    [ActionNames.registration]: 'Показує регу на івенти в МВ',
    [ActionNames.ru]: 'русскій воєнний корабль іді нахуй',
    [ActionNames.sadwhy]:
        'Реагує сумними/емоційними реакціями коли негативно згадують "железяка"',
    [ActionNames.slon]: 'Реагує на згадки "слон" тематичним відео',
    [ActionNames.ternopil]:
        'Надає спеціальні відповіді на повідомлення від користувачів з Тернополя',
    [ActionNames.test]: 'тест',
    [ActionNames.vitalii]: 'Відслідковує коли Віталій згадує "маліфо"',
    [ActionNames.voice]: 'Посилає нахуй за голосовухі',
    [ActionNames.discussion]: 'Слідкує за довгими дискуссіями',
    [ActionNames.spellcoins]: 'Показує баланс на рахунку'
};
