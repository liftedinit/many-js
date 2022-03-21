import { Message } from "../message";
import cbor from "cbor";

describe("Message", () => {
  test("can be constructed from an object", () => {
    const msg = { method: "info" };
    const req = Message.fromObject(msg);

    expect(req).toHaveProperty("content");
  });
  test("can be serialized/deserialized", () => {
    const msg = { method: "info" };
    const req = Message.fromObject(msg);
    const cbor = req.toCborData();

    expect(Message.fromCborData(cbor)).toStrictEqual(req);
  });
});
