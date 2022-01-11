import * as identity from "./identity";

describe("identity", () => {
  const publicKey = Buffer.from([
    212, 98, 187, 130, 193, 168, 253, 87, 174, 146, 90, 55, 239, 156, 57, 72,
    124, 116, 29, 162, 239, 193, 191, 6, 124, 134, 68, 104, 182, 57, 17, 196,
  ]);

  const id = identity.fromPublicKey(publicKey);
  const hexId = "016ec855dc20ba87759f24bfc123491a50a3f93cacbe0cb5636b9bb95e";
  const stringId = "oafxmqvo4ec5io5m7es74ci2jdjikh6j4vs7aznldnon3sxqt6";

  test("fromPublicKey", () => {
    expect(identity.fromPublicKey(publicKey)).toStrictEqual(id);
  });

  test("fromString", () => {
    expect(identity.fromString(stringId)).toStrictEqual(id);
  });

  test("toString", () => {
    expect(identity.toString(id)).toStrictEqual(stringId);
  });

  test("fromHex", () => {
    expect(identity.fromHex(hexId)).toStrictEqual(id);
  });

  test("toHex", () => {
    expect(identity.toHex(id)).toStrictEqual(hexId);
  });
});
