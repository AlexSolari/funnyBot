export type EventStatus = 'expired' | 'open';
export type EventCategory = 'other' | 'mtg';

export type EventDto = {
    event_id: string;
    status: EventStatus;
    category: EventCategory;
    title: string;
    start_datetime: string;
    price: string;
    prizes: string;
    chat_id: number;
    message_thread_id: number;
    poll_message_id: number;
    poll_id: string;
    message_link: string;
    created_by: number;
    created_at: string;
    expires_at: string;
    tags: string[] | null;
};
