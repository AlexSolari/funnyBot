import escape from 'markdown-escape';

export default function escapeMarkdown(text: string) {
    return escape(text)
        .replaceAll(/\./g, '\\.')
        .replaceAll(/-/g, '\\-')
        .replaceAll(/\+/g, '\\+')
        .replaceAll(/\{/g, '\\{')
        .replaceAll(/\}/g, '\\}');
}
