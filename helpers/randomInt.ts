export default function randomInteger(x1: number, x2: number): number {
    const range = x2 - x1 + 1;

    const random = Math.floor(Math.random() * range);

    return random + x1;
}
