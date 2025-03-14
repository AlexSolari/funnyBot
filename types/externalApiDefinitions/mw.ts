import { Seconds } from 'chz-telegram-bot';

export interface IMWEventDetail {
    date: Date | string;
    id: number;
    gt: {
        name: string;
        space: number;
        used_space: number;
        service: { name: string };
    };
    time: { start_time: Seconds };
}

export interface IMwApiResponseDateSlot {
    date: Date;
    slots: IMWEventDetail[];
}

export interface IMWApiResponse {
    slots: { date_slots: IMwApiResponseDateSlot[] }[];
}
