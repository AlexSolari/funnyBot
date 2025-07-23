export function replacer<K, V>(_: K, value: V) {
    if (value instanceof Map) {
        return {
            dataType: 'Map',
            value: Array.from(value.entries()) // or with spread: value: [...value]
        };
    } else {
        return value;
    }
}

export function reviver<K, V>(_: K, value: V) {
    if (typeof value === 'object' && value !== null) {
        if (
            'dataType' in value &&
            'value' in value &&
            value.dataType === 'Map'
        ) {
            return new Map(value.value as []);
        }
    }
    return value;
}
