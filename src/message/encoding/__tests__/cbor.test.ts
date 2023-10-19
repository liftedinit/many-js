import { cborDataFromString, cborDataToString } from "../cbor";

describe("cbor", () => {
  describe("cborDataFromString", () => {
    it("should return a Uint8Array", () => {
      const array = cborDataFromString("foo");
      expect(array instanceof Uint8Array).toBe(true);
    });
    it("should return the correct data", () => {
      const btc = cborDataFromString("₿");
      expect(btc).toStrictEqual(new Uint8Array([226, 130, 191]));
    });
    it("should work for hex encodings", () => {
      const btc = cborDataFromString("e282bf", "hex");
      expect(btc).toStrictEqual(new Uint8Array([226, 130, 191]));
    });
    it("should be case insensitive", () => {
      const foo = cborDataFromString("f00", "hex");
      const FOO = cborDataFromString("F00", "hex");
      expect(foo).toStrictEqual(FOO);
    });
  });
  describe("cborDataToString", () => {
    it("should return a string", () => {
      const str = cborDataToString(new Uint8Array([102, 111, 111]));
      expect(typeof str).toBe("string");
    });
    it("should return the correct data", () => {
      const btc = cborDataToString(new Uint8Array([226, 130, 191]));
      expect(btc).toBe("₿");
    });
    it("should work for hex encodings", () => {
      const btc = cborDataToString(new Uint8Array([226, 130, 191]), "hex");
      expect(btc).toBe("e282bf");
    });
  });
});
