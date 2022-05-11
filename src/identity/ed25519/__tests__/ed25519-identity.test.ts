import { Ed25519KeyPairIdentity } from "../ed25519-key-pair-identity"

describe("keys", () => {
  test("getSeedWords", () => {
    const seedWords = Ed25519KeyPairIdentity.getMnemonic()

    expect(seedWords.split(" ")).toHaveLength(12)
  })

  test("fromSeedWords", () => {
    const seedWords = Ed25519KeyPairIdentity.getMnemonic()
    const badWords = "abandon abandon abandon"

    const alice = Ed25519KeyPairIdentity.fromMnemonic(seedWords)
    const bob = Ed25519KeyPairIdentity.fromMnemonic(seedWords)

    expect(alice.privateKey).toStrictEqual(bob.privateKey)
    expect(() => {
      Ed25519KeyPairIdentity.fromMnemonic(badWords)
    }).toThrow()
  })

  test("fromPem", () => {
    const pem = `
      -----BEGIN PRIVATE KEY-----
      MC4CAQAwBQYDK2VwBCIEICT3i6WfLx4t3UF6R8aEfczyATc/jvqvOrNga2MJfA2R
      -----END PRIVATE KEY-----`
    const badPem = `
      -----BEGIN PRIVATE CAT-----
      MEOW
      -----END PRIVATE CAT-----`

    const alice = Ed25519KeyPairIdentity.fromPem(pem)
    const bob = Ed25519KeyPairIdentity.fromPem(pem)

    expect(alice.privateKey).toStrictEqual(bob.privateKey)
    expect(() => {
      Ed25519KeyPairIdentity.fromPem(badPem)
    }).toThrow()
  })
})
