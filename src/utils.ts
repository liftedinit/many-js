export function objToMap(obj: Object): Map<any, any> {
  const map = new Map();
  Object.entries(obj).forEach(([key, value]) => {
    map.set(key, value);
  });
  return map;
}
