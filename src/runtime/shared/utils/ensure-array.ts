import { type Ref } from 'vue';
import { unwrapRef } from './unwrap-ref';



export function ensureArray<T>(data: T[] | Ref<T[]>): T[] {
    const arrayData = unwrapRef(data);
    if (!Array.isArray(arrayData)) {
        throw new Error("Expected an array of data to validate.");
    }
    return arrayData;
}