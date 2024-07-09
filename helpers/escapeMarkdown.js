import escape from "markdown-escape";

export default function escapeMarkdown(text){
    return escape(text)
        .replaceAll(/\./g, '\\.')
        .replaceAll(/\-/g, '\\-')
        .replaceAll(/\+/g, '\\+')
        .replaceAll(/\{/g, '\\{')
        .replaceAll(/\}/g, '\\}');
}