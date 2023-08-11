import { Response } from "../response";

describe("Response", () => {
  test.skip("can be serialized/deserialized", async () => {
    const res = new Response(new Map([[0, "testing"]]));
    const cbor = await res.toCborData();

    expect(Response.fromCborData(cbor)).toStrictEqual(res);
  });
});
