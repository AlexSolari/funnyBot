export default function stripPunctuation(input: string): string {
    return input.replaceAll(/\p{P}/gu, ' ').replaceAll(/\s+/g, ' ').trim();
}
