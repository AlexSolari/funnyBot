const MARKDOWN_V2_SPECIAL_CHARS = /[_*[\]()~`>#+=|{}.!-]/g;

export default function escapeMarkdown(text: string) {
    return text.replaceAll(MARKDOWN_V2_SPECIAL_CHARS, '\\$&');
}
