export const EventType = {
    requestStart: 'api.custom.requestStart',
    requestEnd: 'api.custom.requestEnd'
} as const;

export type EventMap = {
    [EventType.requestStart]: { endpoint: string };
    [EventType.requestEnd]: { endpoint: string };
};
