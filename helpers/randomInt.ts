type BuildTuple<
    N extends number,
    R extends unknown[] = []
> = R['length'] extends N ? R : BuildTuple<N, [...R, unknown]>;

type RangeInclusive<
    Start extends number,
    End extends number,
    R extends unknown[] = BuildTuple<Start>,
    Acc extends number[] = []
> = R['length'] extends End
    ? [...Acc, R['length']][number]
    : RangeInclusive<Start, End, [...R, unknown], [...Acc, R['length']]>;

export function randomInt<Min extends number, Max extends number>(
    min: Min,
    max: Max
): RangeInclusive<Min, Max> {
    return (Math.floor(Math.random() * (max - min + 1)) +
        min) as RangeInclusive<Min, Max>;
}
