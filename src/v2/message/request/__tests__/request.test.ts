import { Request } from "../request"

describe("Request", () => {
  test("can be constructed from an object", () => {
    const msg = { method: "info" }
    const req = Request.fromObject(msg)

    expect(req).toHaveProperty("content")
    expect(req.content.get(3)).toBe("info")
  })
  test("can be serialized/deserialized", async () => {
    const msg = { method: "info" }
    const req = Request.fromObject(msg)
    const cbor = await req.toBuffer()

    expect(Request.fromBuffer(cbor)).toStrictEqual(req)
  })
})
