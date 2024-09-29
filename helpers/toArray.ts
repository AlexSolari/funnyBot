export default function toArray<TType>(value: TType | TType[]){
    return Array.isArray(value) ? value : [value];
}