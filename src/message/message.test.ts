import * as message from "../message";

describe("message", () => {
  test("encode", () => {
    const msg = { method: "echo" };
    const encoded = message.encode(msg);
    expect(encoded).not.toBe(null);
  });
  test("decode", () => {
    const msg = { method: "echo" };
    const encoded = message.encode(msg);
    const decoded = message.decode(encoded);
    expect(decoded).not.toBe(null);
  });
});
