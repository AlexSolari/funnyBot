import { Hours, Milliseconds, Seconds } from '../types/timeValues';

export function secondsToMilliseconds(value: Seconds): Milliseconds {
    return (value * 1000) as Milliseconds;
}

export function hoursToMilliseconds(value: Hours): Milliseconds {
    return (value * 60 * 60 * 1000) as Milliseconds;
}

export function hoursToSeconds(value: Hours): Seconds {
    return (value * 60 * 60) as Seconds;
}
