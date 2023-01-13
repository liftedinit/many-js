import { CoseKey } from "../../../message/encoding"
import { Identifier } from "../../identifier"
import { KeyPair } from "../keypair"

describe("KeyPair", () => {
  describe("constructor", () => {
    it("should return a keypair identifier", () => {
      const keypair = new KeyPair(
        new Uint8Array(1),
        new Uint8Array(new Array(32).fill(2)),
      )
      expect(keypair instanceof KeyPair).toBe(true)
      expect(keypair instanceof Identifier).toBe(true)
    })
    it("should set the public and private keys", () => {
      const keypair = new KeyPair(
        new Uint8Array(1),
        new Uint8Array(new Array(32).fill(2)),
      )

      expect(keypair.publicKey).toBeDefined()
    })
    it("should throw on too short a private key", () => {
      expect(() => new KeyPair(new Uint8Array(1), new Uint8Array(2))).toThrow()
    })
  })
  describe("sign", () => {
    it("should return a signature", async () => {
      const keypair = new KeyPair(
        new Uint8Array(1),
        new Uint8Array(new Array(32).fill(2)),
      )

      const sig1 = await keypair.sign(Buffer.from("foo"))
      const sig2 = await keypair.sign(Buffer.from("bar"))

      expect(sig1).not.toStrictEqual(sig2)
    })
  })
  describe("toString", () => {
    it("should return a Many address", () => {
      const keypair = new KeyPair(
        new Uint8Array(0),
        new Uint8Array(new Array(32).fill(2)),
      )

      expect(keypair.toString()).toMatch(/^m\w+$/)
    })
  })
  describe("toCoseKey", () => {
    it("should return a COSE Key", () => {
      const keypair = new KeyPair(
        new Uint8Array(0),
        new Uint8Array(new Array(32).fill(2)),
      )
      const coseKey = keypair.toCoseKey()

      expect(coseKey instanceof CoseKey).toBe(true)
    })
    it("should embed the public key", () => {
      const keypair = new KeyPair(
        new Uint8Array(0),
        new Uint8Array(new Array(32).fill(2)),
      )
      const coseKey = keypair.toCoseKey()

      expect(coseKey.publicKey).toStrictEqual(keypair.publicKey)
    })
  })
  describe("fromString", () => {
    it("should throw", () => {
      const address = "maeo2ob5e6mgaxr2lqg6muoqwuqz6j3t6wv3eig4wgymkouafh"

      expect(() => KeyPair.fromString(address)).toThrow()
    })
  })
  describe("getSeedWords", () => {
    it("should return 12 words", () => {
      const seedWords = KeyPair.getMnemonic()

      expect(seedWords.split(" ")).toHaveLength(12)
    })
  })
  describe("fromMnemonic", () => {
    it("should return a keypair identifier", () => {
      const seedWords = KeyPair.getMnemonic()
      const keypair = KeyPair.fromMnemonic(seedWords)

      expect(keypair instanceof KeyPair).toBe(true)
      expect(keypair instanceof Identifier).toBe(true)
    })
    it("should throw on a bad mnemonic", () => {
      const seedWords = "abandon abandon abandon"

      expect(() => KeyPair.fromMnemonic(seedWords)).toThrow()
    })
    it("should return a unique keypair", () => {
      const seedWords1 = KeyPair.getMnemonic()
      const seedWords2 = KeyPair.getMnemonic()

      const keypair1 = KeyPair.fromMnemonic(seedWords1)
      const keypair2 = KeyPair.fromMnemonic(seedWords2)

      expect(keypair1.toString()).not.toBe(keypair2.toString())
    })
  })
  describe("fromPem", () => {
    it("should return a keypair identifier", () => {
      const pem = `
      -----BEGIN PRIVATE KEY-----
      MC4CAQAwBQYDK2VwBCIEICT3i6WfLx4t3UF6R8aEfczyATc/jvqvOrNga2MJfA2R
      -----END PRIVATE KEY-----`
      const keypair = KeyPair.fromPem(pem)

      expect(keypair instanceof KeyPair).toBe(true)
      expect(keypair instanceof Identifier).toBe(true)
    })
    it("should throw on a bad PEM", () => {
      const pem = `
      -----BEGIN PRIVATE CAT-----
      MEOW
      -----END PRIVATE CAT-----`

      expect(() => KeyPair.fromPem(pem)).toThrow()
    })
  })
})
