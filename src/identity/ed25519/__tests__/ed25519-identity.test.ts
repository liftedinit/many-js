import { Ed25519KeyPairIdentity } from "../ed25519-key-pair-identity"

describe("keys", () => {
  test("getSeedWords", () => {
    const seedWords = Ed25519KeyPairIdentity.getMnemonic()

    expect(seedWords.split(" ")).toHaveLength(12)
  })

  test("fromMnemonic", async function () {
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

  test("fromHex", async function () {
    const seed = "2690a9878f3e2bf5e7a5df08261334c2"
    const alice = Ed25519KeyPairIdentity.fromHex(seed)
    const aliceAddress = (await alice.getAddress()).toString()
    expect(aliceAddress).toBe(
      "maeo2ob5e6mgaxr2lqg6muoqwuqz6j3t6wv3eig4wgymkouafh",
    )
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
