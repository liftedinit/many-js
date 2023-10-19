import { Anonymous } from "../anonymous";
import { Identifier } from "../../identifier";
import { cborDataFromString } from "../../../message/encoding";

describe("Anonymous", () => {
  describe("constructor", () => {
    it("should return an anonymous identifier", () => {
      const anon = new Anonymous();

      expect(anon instanceof Anonymous).toBe(true);
      expect(anon instanceof Identifier).toBe(true);
    });
    it("should set a publicKey", () => {
      const anon = new Anonymous();

      expect(anon.publicKey).toBeDefined();
    });
  });
  describe("sign", () => {
    it("should return an empty buffer", async () => {
      const anon = new Anonymous();

      const sig = await anon.sign(cborDataFromString("foo"));

      expect(sig).toStrictEqual(new ArrayBuffer(0));
    });
  });
  describe("toString", () => {
    it("should return `maa`", () => {
      const anon = new Anonymous();

      expect(anon.toString()).toBe("maa");
    });
  });
  describe("fromString", () => {
    it("should return an anonymous identifier", () => {
      const anon = Anonymous.fromString("maa");

      expect(anon instanceof Anonymous).toBe(true);
      expect(anon instanceof Identifier).toBe(true);
    });
    it("should error on a bad string", () => {
      expect(() => Anonymous.fromString("bad")).toThrow();
    });
  });
});
