import { Response } from "../../../message"

describe("Response", () => {
  test.skip("can be serialized/deserialized", async () => {
    const res = new Response(new Map([[0, "testing"]]))
    const cbor = await res.toBuffer()

    expect(Response.fromBuffer(cbor)).toStrictEqual(res)
  })
})
