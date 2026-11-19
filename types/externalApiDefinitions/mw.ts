import { Seconds } from 'chz-telegram-bot';

export interface IMWEventDetail {
    id: number;
    gt: {
        name: string | null;
        space: number;
        used_space: number;
        service?: { name: string | null };
    };
    /** Seconds since local midnight of the parent date slot. */
    time: { start_time: Seconds };
}

export interface IMwApiResponseDateSlot {
    /** Local calendar date, `YYYY-MM-DD`. */
    date: string;
    slots: IMWEventDetail[];
}

export interface IMWApiResponse {
    slots: { date_slots: IMwApiResponseDateSlot[] }[];
}
