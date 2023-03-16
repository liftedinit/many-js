import { makeRandomBytes, fromString, toString } from "../utils";

describe("Utils", () => {
  describe("makeRandomBytes", () => {
    it("should not make the same bytes each time", () => {
      expect(makeRandomBytes()).not.toStrictEqual(makeRandomBytes());
    });
  });
  describe("fromString", () => {
    it("should return a Uint8Array", () => {
      const array = fromString("foo");
      expect(array instanceof Uint8Array).toBe(true);
    });
    it("should return the correct data", () => {
      const btc = fromString("₿");
      expect(btc).toStrictEqual(new Uint8Array([226, 130, 191]));
    });
    it("should work for hex encodings", () => {
      const btc = fromString("e282bf", "hex");
      expect(btc).toStrictEqual(new Uint8Array([226, 130, 191]));
    });
  });
  describe("toString", () => {
    it("should return a string", () => {
      const str = toString(new Uint8Array([102, 111, 111]));
      expect(typeof str).toBe("string");
    });
    it("should return the correct data", () => {
      const btc = toString(new Uint8Array([226, 130, 191]));
      expect(btc).toBe("₿");
    });
    it("should work for hex encodings", () => {
      const btc = toString(new Uint8Array([226, 130, 191]), "hex");
      expect(btc).toBe("e282bf");
    });
  });
});
