import { Identifier } from "../identifier";
import { strToBytes } from "../../../shared/utils";
import { IDS } from "./data";

describe("Identifier", () => {
  describe("constructor", () => {
    it("should return an identifier", () => {
      const id = new Identifier();

      expect(id instanceof Identifier).toBe(true);
    });
    it("should set a publicKey", () => {
      const id = new Identifier();

      expect(id.publicKey).toBeDefined();
    });
  });
  describe("sign", () => {
    it("should throw an error", async () => {
      const id = new Identifier();

      await expect(id.sign(strToBytes("foo"))).rejects.toThrow();
    });
  });
  describe("toCoseKey", () => {
    it("should throw an error", () => {
      const id = new Identifier();

      expect(() => id.toCoseKey()).toThrow();
    });
  });
  describe("toString", () => {
    it("should return `maa` for anonymous", () => {
      const id = new Identifier();

      expect(id.toString()).toEqual(IDS.ANONYMOUS.ADDRESS);
    });
    it("should return a Many address", () => {
      const id = new Identifier(new Uint8Array(new Array(32).fill(2)));

      expect(id.toString()).toMatch(/^m\w+$/);
    });
    it("should return the expected Many address", () => {
      const id = Identifier.fromString(IDS.ALICE.ADDRESS);

      expect(id.toString()).toEqual(IDS.ALICE.ADDRESS);
    });
  });
  describe("fromString", () => {
    it("should work for an anonymous address", () => {
      const id = Identifier.fromString(IDS.ANONYMOUS.ADDRESS);

      expect(id.publicKey).toEqual(IDS.ANONYMOUS.PUBLICKEY);
    });
    it("should work for a non-anonymous address", () => {
      const id = Identifier.fromString(IDS.ALICE.ADDRESS);

      expect(id.publicKey).toEqual(IDS.ALICE.PUBLICKEY);
    });

    it("should error on a bad string", () => {
      expect(() => Identifier.fromString("foo")).toThrow();
    });
  });
});
