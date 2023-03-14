import { mapToObj, objToMap, Transform } from "../transform"

type Simple = { name: string }
type List = { names: Simple[] }
type Mapped = { names: Map<string, number> }
type Fn = { number: number }

const simple: Transform = { 0: "name" }
const list: Transform = {
  0: ["names", { type: "array", transform: { 0: "name" } }],
}
const mapped: Transform = {
  0: ["names", { type: "map", transform: { 0: "age" } }],
}
const decode: Transform = {
  0: ["number", { fn: (value: string) => parseInt(value) }],
}
const encode: Transform = {
  0: ["number", { fn: (value: string) => Buffer.from(value) }],
}

describe("Transform", () => {
  describe("mapToObj", () => {
    it("should return a simple object from a simple map", () => {
      const map = new Map([[0, "foo"]])
      const obj: Simple = mapToObj(map, simple)

      expect(obj).toHaveProperty("name")
      expect(obj?.name).toBe("foo")
    })
    it("should apply a sub-transform to an array", () => {
      const map = new Map([[0, [new Map([[0, "foo"]]), new Map([[0, "bar"]])]]])
      const obj: List = mapToObj(map, list)

      expect(obj).toHaveProperty("names")
      expect(obj?.names).toHaveLength(2)
      expect(obj?.names[0].name).toBe("foo")
    })
    it("should apply a sub-transform to a map", () => {
      const map = new Map([
        [
          0,
          new Map([
            ["foo", new Map([[0, 42]])],
            ["bar", new Map([[0, 21]])],
          ]),
        ],
      ])
      const obj: Mapped = mapToObj(map, mapped)

      expect(obj).toHaveProperty("names")
      expect(obj?.names).toHaveProperty("foo")
      expect(obj?.names).toStrictEqual({ foo: { age: 42 }, bar: { age: 21 } })
    })
    it("should apply a transform function", () => {
      const map = new Map([[0, "0x2a"]])
      const obj: Fn = mapToObj(map, decode)

      expect(obj).toHaveProperty("number")
      expect(obj?.number).toBe(42)
    })
  })
  describe("objToMap", () => {
    it("should return a simple map from a simple object", () => {
      const obj = { name: "foo" }
      const map = objToMap(obj, simple)

      expect(map.has(0)).toBe(true)
      expect(map.get(0)).toBe("foo")
    })
    it("should apply a sub-transform to an array", () => {
      const obj = { names: [{ name: "foo" }, { name: "bar" }] }
      const map = objToMap(obj, list)

      expect(map.has(0)).toBe(true)
      expect(map.get(0)).toHaveLength(2)
      expect(map.get(0)[0].get(0)).toBe("foo")
    })
    it("should apply a sub-transform to a map", () => {
      const obj = { names: { foo: { age: 42 }, bar: { age: 21 } } }
      const map = objToMap(obj, mapped)

      expect(map.has(0)).toBe(true)
      expect(map.get(0).has("foo")).toBe(true)
      expect(map.get(0).get("foo").get(0)).toBe(42)
    })
    it("should apply a transform function", () => {
      const obj = { number: "0x2a" }
      const map = objToMap(obj, encode)

      expect(Buffer.isBuffer(map.get(0))).toBe(true)
      expect(map.get(0).toString()).toBe("0x2a")
    })
  })
})
