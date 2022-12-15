export type Transform = Record<Key, Field>
type Key = string | number
type Field = Key | [Key, Transform?, Options?]
type Options = { type?: "array" | "map" }
type CborMap = Map<Key, any>

export function mapToObj<T>(map: CborMap, xform: Transform): T {
  const obj: Partial<T> = {}
  Object.entries(xform).forEach(([mapKey, objField]) => {
    const value = map.get(parseInt(mapKey))
    if (value === undefined) {
      obj[objField as keyof T] = undefined
    } else if (typeof objField === "string") {
      obj[objField as keyof T] = value
    } else {
      const [objKey, subXform, options] = objField as [Key, Transform, Options]
      const key = objKey as keyof T
      switch (options?.type) {
        case "array":
          obj[key] = value.map((subValue: any) => mapToObj(subValue, subXform))
          break
        case "map":
          obj[key] = [...value.entries()].reduce(
            (acc, [subKey, subValue]) => ({
              ...acc,
              [subKey]: subXform ? mapToObj(subValue, subXform) : subValue,
            }),
            {},
          )
          break
        default:
          obj[key] = mapToObj(value, subXform)
      }
    }
  })
  return obj as T
}

export function objToMap<T>(obj: T, xform: Transform): CborMap {
  const map: CborMap = new Map()
  Object.entries(xform).forEach(([mapKey, objField]) => {
    let value
    if (!obj) {
      value = undefined
    } else if (typeof objField === "string") {
      value = obj[objField as keyof T]
    } else {
      const [objKey, subXform, options] = objField as [Key, Transform, Options]
      const objValue = obj[objKey as keyof T]
      switch (options?.type) {
        case "array":
          value = (objValue as any[]).map((subValue: any) =>
            objToMap(subValue, subXform),
          )
          break
        case "map":
          value = Object.entries(objValue as Record<Key, any>).reduce(
            (acc, [subKey, subValue]) =>
              acc.set(
                subKey,
                subXform ? objToMap(subValue, subXform) : subValue,
              ),
            new Map(),
          )
          break
        default:
          value = objToMap(objValue, subXform)
      }
    }
    map.set(parseInt(mapKey), value)
  })
  return map
}
