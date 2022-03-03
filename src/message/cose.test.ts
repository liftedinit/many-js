import { Message } from "../message";
import { CoseMessage, CoseKey } from "./cose";
import { KeyPair } from "../keys";

describe("CoseMessage", () => {
  test("can make anonymous request", () => {
    const anonymousMessage = Message.fromObject({ method: "info" });
    const coseMessage = CoseMessage.fromMessage(anonymousMessage);

    expect(coseMessage.signature).toHaveLength(0);
  });

  test("can make signed request", () => {
    const keys = KeyPair.fromMnemonic(KeyPair.getMnemonic());
    const signedMessage = Message.fromObject({ method: "info" });
    const coseMessage = CoseMessage.fromMessage(signedMessage, keys);

    expect(coseMessage.signature).not.toHaveLength(0);
  });

  test("can serialize/deserialize CBOR", () => {
    const request = Message.fromObject({ method: "info" });
    const coseMessage = CoseMessage.fromMessage(request);
    const serialized = coseMessage.toCborData();
    const deserialized = CoseMessage.fromCborData(serialized);

    expect(deserialized.content).toStrictEqual(coseMessage.content);
  });
});

describe("CoseKey", () => {
  test.skip("fromPublicKey", () => {});
});
