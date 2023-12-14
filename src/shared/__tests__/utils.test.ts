import { warn } from "console";
import {
  bufferToStr,
  bytesToBuffer,
  bytesToHex,
  bytesToStr,
  compareBytes,
  h,
  hexToBuffer,
  hexToBytes,
  makeRandomBytes,
  strToBuffer,
  strToBytes,
} from "../utils";
import { BITCOIN } from "./data";

describe("Utils", () => {
  describe("makeRandomBytes", () => {
    it("should return a Uint8Array", () => {
      const bytes = makeRandomBytes();

      expect(bytes instanceof Uint8Array).toBe(true);
    });
    it("should not make the same bytes each time", () => {
      expect(makeRandomBytes()).not.toStrictEqual(makeRandomBytes());
    });
  });
  describe("strToBytes", () => {
    it("should convert a string to a Uint8Array", () => {
      const bytes = strToBytes(BITCOIN.STR);

      expect(bytes.buffer).toEqual(BITCOIN.BYTES.buffer);
    });
  });
  describe("strToBuffer", () => {
    it("should convert a string to an ArrayBuffer", () => {
      const ab = strToBuffer(BITCOIN.STR);

      expect(ab).toEqual(BITCOIN.BYTES.buffer);
    });
  });
  describe("hexToBytes", () => {
    it("should convert a hex string to a Uint8Array", () => {
      expect(hexToBytes(BITCOIN.HEX)).toEqual(BITCOIN.BYTES);
    });
  });
  describe("hexToBuffer", () => {
    it("should convert a hex string to an ArrayBuffer", () => {
      const ab = hexToBuffer(BITCOIN.HEX);

      expect(ab).toBeInstanceOf(ArrayBuffer);
      expect(ab).toEqual(BITCOIN.BYTES.buffer);
    });
  });
  describe("h", () => {
    it("should convert a hex string literal to a Uint8Array", () => {
      expect(h`e282bf`).toEqual(BITCOIN.BYTES);
    });
  });
  describe("bytesToBuffer", () => {
    it("should convert a Uint8Array to an ArrayBuffer", () => {
      const ab = bytesToBuffer(BITCOIN.BYTES);

      expect(ab).toBeInstanceOf(ArrayBuffer);
      expect(ab).toEqual(BITCOIN.BYTES.buffer);
    });
  });
  describe("bytesToStr", () => {
    it("should convert a Uint8Array to a UTF-8 string", () => {
      expect(bytesToStr(BITCOIN.BYTES)).toEqual(BITCOIN.STR);
    });
  });
  describe("bytesToHex", () => {
    it("should convert a Uint8Array to a hex string", () => {
      expect(bytesToHex(BITCOIN.BYTES)).toEqual(BITCOIN.HEX);
    });
  });
  describe("compareBytes", () => {
    it("should return true if the bytes are the same", () => {
      expect(compareBytes(BITCOIN.BYTES, BITCOIN.BYTES)).toBe(true);
    });
    it("should return false if the bytes are different", () => {
      expect(compareBytes(BITCOIN.BYTES, new Uint8Array([42]))).toBe(false);
    });
    it("should work when comparing Uint8Arrays and Buffers", () => {
      const buf = Buffer.from(BITCOIN.BYTES);
      expect(compareBytes(BITCOIN.BYTES, buf)).toBe(true);
    });
  });
  describe("bufferToStr", () => {
    it("should convert an ArrayBuffer to a UTF-8 string", () => {
      expect(bufferToStr(BITCOIN.BYTES.buffer)).toEqual(BITCOIN.STR);
    });
  });
});
