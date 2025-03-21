import { Seconds } from 'chz-telegram-bot';
import { Moment } from 'moment';

export interface IMWEventDetail {
    date: string;
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
    date: Moment;
    slots: IMWEventDetail[];
}

export interface IMWApiResponse {
    slots: { date_slots: IMwApiResponseDateSlot[] }[];
}
