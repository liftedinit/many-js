export type Transform = Record<Key, Field>
type Key = string | number
type Field = Key | [Key, Options?]
type Options = {
  transform?: Transform
  type?: "array" | "map" | "bytes"
  fn?: (value: any) => any
}
type CborMap = Map<Key, any>

export function mapToObj<T>(map: CborMap, xform: Transform): T {
  const obj: Partial<T> = {}
  Object.entries(xform).forEach(([xformKey, xformField]) => {
    const mapKey = parseInt(xformKey) ?? xformKey
    const mapValue = map.get(mapKey)
    const objKey = xformField as keyof T
    if (!map.has(mapKey) || mapValue === undefined) {
      // Value is missing for this property
      obj[objKey] = undefined
    } else if (typeof xformField === "string") {
      // A simple value is present
      obj[objKey] = mapValue
    } else {
      // The value requires further processing
      const [xformKey, { transform, type, fn = (v: any) => v }] =
        xformField as [Key, Options]
      const objKey = xformKey as keyof T
      switch (type) {
        case "array":
          obj[objKey] = mapValue.map((subValue: any) =>
            transform ? mapToObj(subValue, transform) : fn(subValue),
          )
          break
        case "map":
          obj[objKey] = [...mapValue.entries()].reduce(
            (acc, [subKey, subValue]) => ({
              ...acc,
              [subKey]: transform
                ? mapToObj(subValue, transform)
                : fn(subValue),
            }),
            {},
          )
          break
        case "bytes":
          obj[objKey] = mapValue.toString("hex")
          break
        default:
          obj[objKey] = transform ? mapToObj(mapValue, transform) : fn(mapValue)
      }
    }
  })
  return obj as T
}

export function objToMap<T>(obj: T, xform: Transform): CborMap {
  const map: CborMap = new Map()
  Object.entries(xform).forEach(([xformKey, xformField]) => {
    const objKey = xformField as keyof T
    let value
    if (!obj) {
      value = undefined
    } else if (typeof xformField === "string") {
      value = obj[objKey]
    } else {
      // The value requires further processing
      const [xformKey, { transform, type, fn = (value: any) => value }] =
        xformField as [Key, Options]
      const objValue = obj[xformKey as keyof T]
      switch (type) {
        case "array":
          value = (objValue as any[]).map((subValue: any) =>
            transform ? objToMap(subValue, transform) : fn(subValue),
          )
          break
        case "map":
          value = Object.entries(objValue as Record<Key, any>).reduce(
            (acc, [subKey, subValue]) =>
              acc.set(
                subKey,
                transform ? objToMap(subValue, transform) : fn(subValue),
              ),
            new Map(),
          )
          break
        case "bytes":
          value = Buffer.from(objValue as string)
          break
        default:
          value = transform ? objToMap(objValue, transform) : fn(objValue)
      }
    }
    if (value !== undefined) {
      map.set(parseInt(xformKey), value)
    }
  })
  return map
}
