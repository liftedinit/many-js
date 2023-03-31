import cbor from "cbor";
import { CoseKey } from "../../../message/encoding";
import { Identifier } from "../../identifier";
import { KeyPair } from "../keypair";
import { fromString } from "../../../shared/utils";
import { IDS } from "./data";

describe("KeyPair", () => {
  describe("constructor", () => {
    it("should return a keypair identifier", () => {
      const keypair = new KeyPair(
        new Uint8Array(1),
        new Uint8Array(new Array(32).fill(2)),
      );
      expect(keypair instanceof KeyPair).toBe(true);
      expect(keypair instanceof Identifier).toBe(true);
    });
    it("should set the public and private keys", () => {
      const keypair = new KeyPair(
        new Uint8Array(1),
        new Uint8Array(new Array(32).fill(2)),
      );

      expect(keypair.publicKey).toBeDefined();
    });
    it("should throw on too short a private key", () => {
      expect(() => new KeyPair(new Uint8Array(1), new Uint8Array(2))).toThrow();
    });
  });
  describe("sign", () => {
    it("should return a signature", async () => {
      const keypair = new KeyPair(
        new Uint8Array(1),
        new Uint8Array(new Array(32).fill(2)),
      );

      const sig1 = await keypair.sign(fromString("foo"));
      const sig2 = await keypair.sign(fromString("bar"));

      expect(sig1).not.toStrictEqual(sig2);
    });
    it("should return the correct signature", async () => {
      const keypair = KeyPair.fromPem(IDS.ALICE.PEM);
      const toBeSigned = cbor.encodeCanonical([
        "Signature1",
        Buffer.from(
          "A3012704581D0158DFA1E41AA0547281EDFCAFDF0405075A9174D4EA491666D9FE0D8F666B6579736574584E81A6010102581D0158DFA1E41AA0547281EDFCAFDF0405075A9174D4EA491666D9FE0D8F032704810220062158208245075673CEAADBEE59214EA777E604A507B4A9D5704D0DE3DF602E1C0452D9",
          "hex",
        ),
        new Uint8Array(),
        Buffer.from(
          "D92711A301D92710581D0158DFA1E41AA0547281EDFCAFDF0405075A9174D4EA491666D9FE0D8F036673746174757305C11A6425D329",
          "hex",
        ),
      ]);
      const expectedSig =
        "5867D485C8996EF3DBC3C28F967DA0265A1444735054D1F6E17ACB86F656552FB5AFE09DAD2083398D06F5373A569B875F688B0FBD896FE1FA16B6D4EB7D360B";

      const sig = await keypair.sign(toBeSigned);

      expect(sig).toStrictEqual(Buffer.from(expectedSig, "hex"));
    });
  });
  describe("toString", () => {
    it("should return a Many address", () => {
      const keypair = new KeyPair(
        new Uint8Array(0),
        new Uint8Array(new Array(32).fill(2)),
      );

      expect(keypair.toString()).toMatch(/^m\w+$/);
    });
    it("should return the expected Many address", () => {
      const keypair = KeyPair.fromPem(IDS.ALICE.PEM);

      expect(keypair.toString()).toBe(IDS.ALICE.ADDRESS);
    });
    it("should return the expected Many address", () => {
      const keypair = KeyPair.fromMnemonic(IDS.CHARLIE.MNEMONIC);

      expect(keypair.toString()).toBe(IDS.CHARLIE.ADDRESS);
    });
  });
  describe("toCoseKey", () => {
    it("should return a COSE Key", () => {
      const keypair = new KeyPair(
        new Uint8Array(0),
        new Uint8Array(new Array(32).fill(2)),
      );
      const coseKey = keypair.toCoseKey();

      expect(coseKey instanceof CoseKey).toBe(true);
    });
    it("should embed the public key", () => {
      const keypair = new KeyPair(
        new Uint8Array(0),
        new Uint8Array(new Array(32).fill(2)),
      );
      const coseKey = keypair.toCoseKey();

      expect(coseKey.publicKey).toStrictEqual(keypair.publicKey);
    });
  });
  describe("fromString", () => {
    it("should throw", () => {
      expect(() => KeyPair.fromString(IDS.ALICE.ADDRESS)).toThrow();
    });
  });
  describe("getSeedWords", () => {
    it("should return 12 words", () => {
      const seedWords = KeyPair.getMnemonic();

      expect(seedWords.split(" ")).toHaveLength(12);
    });
  });
  describe("fromMnemonic", () => {
    it("should return a keypair identifier", () => {
      const seedWords = KeyPair.getMnemonic();
      const keypair = KeyPair.fromMnemonic(seedWords);

      expect(keypair instanceof KeyPair).toBe(true);
      expect(keypair instanceof Identifier).toBe(true);
    });
    it("should throw on a bad mnemonic", () => {
      const seedWords = "abandon abandon abandon";

      expect(() => KeyPair.fromMnemonic(seedWords)).toThrow();
    });
    it("should return a unique keypair", () => {
      const seedWords1 = KeyPair.getMnemonic();
      const seedWords2 = KeyPair.getMnemonic();

      const keypair1 = KeyPair.fromMnemonic(seedWords1);
      const keypair2 = KeyPair.fromMnemonic(seedWords2);

      expect(keypair1.toString()).not.toBe(keypair2.toString());
    });
  });
  describe("fromPem", () => {
    it("should return a keypair identifier", () => {
      const keypair = KeyPair.fromPem(IDS.ALICE.PEM);

      expect(keypair instanceof KeyPair).toBe(true);
      expect(keypair instanceof Identifier).toBe(true);
    });
    it("should throw on a bad PEM", () => {
      const pem = `
      -----BEGIN PRIVATE CAT-----
      MEOW
      -----END PRIVATE CAT-----`;

      expect(() => KeyPair.fromPem(pem)).toThrow();
    });
  });
});
