export function isDeepEqual(a: any, b: any): boolean {
    if (a === b) return true;
    
    if (a === null || b === null || 
        typeof a !== 'object' || typeof b !== 'object') {
        return a === b;
    }
    
    if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length !== b.length) return false;
        return a.every((item, index) => isDeepEqual(item, b[index]));
    }
    
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    
    if (keysA.length !== keysB.length) return false;
    
    return keysA.every(key => isDeepEqual(a[key], b[key]));
}