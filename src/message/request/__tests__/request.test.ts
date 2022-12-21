import { Message } from "../../message"

describe("Message", () => {
  test("can be constructed from an object", () => {
    const msg = { method: "info" }
    const req = Message.fromObject(msg)

    expect(req).toHaveProperty("content")
  })
  test("can be serialized/deserialized", async () => {
    const msg = { method: "info" }
    const req = Message.fromObject(msg)
    const cbor = await req.toBuffer()

    expect(Message.fromBuffer(cbor)).toStrictEqual(req)
  })
})
