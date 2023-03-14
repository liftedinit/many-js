import { tag } from "../cbor"

describe("cbor", () => {
  test("tag", () => {
    const tagged = tag(1, "foo")
    expect(tagged).toMatchObject({ tag: 1, value: "foo", err: undefined })
  })
})
