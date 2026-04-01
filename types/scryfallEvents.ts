export const ScryfallEventType = {
    requestStart: 'scryfall.requestStart',
    requestEnd: 'scryfall.requestEnd'
} as const;

export type ScryfallEventMap = {
    [ScryfallEventType.requestStart]: { endpoint: string };
    [ScryfallEventType.requestEnd]: { endpoint: string };
};
