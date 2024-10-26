export type Milliseconds = number & { __brand: 'ms' };
export type Seconds = number & { __brand: 's' };
export type Hours = number & { __brand: 'h' };

export type HoursOfDay =
    | 0
    | 1
    | 2
    | 3
    | 4
    | 5
    | 6
    | 7
    | 8
    | 9
    | 10
    | 11
    | 12
    | 13
    | 14
    | 15
    | 16
    | 17
    | 18
    | 19
    | 20
    | 21
    | 22
    | 23;
