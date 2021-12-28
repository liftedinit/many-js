export function objToMap(obj) {
    const map = new Map();
    Object.entries(obj).forEach(([key, value]) => {
        map.set(key, value);
    });
    return map;
}
