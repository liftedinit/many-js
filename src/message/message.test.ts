import { Message, DEFAULT_MESSAGE_DATA } from "../message";
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
    const cborData = req.toCborData();
    const fromCborMessage = Message.fromCborData(cborData);
    /*
      need to set message.content[4] to the default data because
      Message.fromObject sets it to that if data doesn't exist
    */
    fromCborMessage.content.set(4, DEFAULT_MESSAGE_DATA);

    expect(fromCborMessage).toStrictEqual(req);
  });
});
