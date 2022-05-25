import { Ed25519KeyPairIdentity } from "../ed25519-key-pair-identity"

describe("keys", () => {
  test("getSeedWords", () => {
    const seedWords = Ed25519KeyPairIdentity.getMnemonic()

    expect(seedWords.split(" ")).toHaveLength(12)
  })

  test("fromSeedWords", async function () {
    const seedWords = Ed25519KeyPairIdentity.getMnemonic()
    const badWords = "abandon abandon abandon"

    const alice = Ed25519KeyPairIdentity.fromMnemonic(seedWords)
    const bob = Ed25519KeyPairIdentity.fromMnemonic(seedWords)

    const aliceAddress = (await alice.getAddress()).toString()
    const bobAddress = (await bob.getAddress()).toString()

    expect(aliceAddress).toStrictEqual(bobAddress)
    expect(() => {
      Ed25519KeyPairIdentity.fromMnemonic(badWords)
    }).toThrow()
  })

  test("fromPem", async function () {
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

    const aliceAddress = (await alice.getAddress()).toString()
    const bobAddress = (await bob.getAddress()).toString()

    expect(aliceAddress).toStrictEqual(bobAddress)
    expect(() => {
      Ed25519KeyPairIdentity.fromPem(badPem)
    }).toThrow()
  })
})
