type Key = string | number
type CborMap = Map<Key, any>
type XformField = Key | [Key, Xform]
type Xform = Record<Key, XformField>

export function mapToObj<T>(map: CborMap, xform: Xform): T {
  const obj: Partial<T> = {}
  Object.entries(xform).forEach(([mapKey, objField]) => {
    const value = map.get(parseInt(mapKey))
    if (typeof objField === "string") {
      obj[objField as keyof T] = value
    } else {
      const [objKey, subXform] = objField as [Key, Xform]
      obj[objKey as keyof T] = mapToObj(value, subXform)
    }
  })
  return obj as T
}

export function objToMap<T>(obj: T, xform: Xform): CborMap {
  const map = new Map()
  Object.entries(xform).forEach(([mapKey, objField]) => {
    let value
    if (typeof objField === "string") {
      value = obj[objField as keyof T]
    } else {
      const [objKey, subXform] = objField as [Key, Xform]
      value = objToMap(obj[objKey as keyof T], subXform)
    }
    map.set(parseInt(mapKey), value)
  })
  return map
}
