import { KeyPair } from "../keys";

describe("keys", () => {
  test("getSeedWords", () => {
    const seedWords = KeyPair.getMnemonic();

    expect(seedWords.split(" ")).toHaveLength(12);
  });

  test("fromSeedWords", () => {
    const seedWords = KeyPair.getMnemonic();
    const badWords = "abandon abandon abandon";

    const alice = KeyPair.fromMnemonic(seedWords);
    const bob = KeyPair.fromMnemonic(seedWords);

    expect(alice.privateKey).toStrictEqual(bob.privateKey);
    expect(() => {
      KeyPair.fromMnemonic(badWords);
    }).toThrow();
  });

  test("fromPem", () => {
    const pem = `
      -----BEGIN PRIVATE KEY-----
      MC4CAQAwBQYDK2VwBCIEICT3i6WfLx4t3UF6R8aEfczyATc/jvqvOrNga2MJfA2R
      -----END PRIVATE KEY-----`;
    const badPem = `
      -----BEGIN PRIVATE CAT-----
      MEOW
      -----END PRIVATE CAT-----`;

    const alice = KeyPair.fromPem(pem);
    const bob = KeyPair.fromPem(pem);

    expect(alice.privateKey).toStrictEqual(bob.privateKey);
    expect(() => {
      KeyPair.fromPem(badPem);
    }).toThrow();
  });
});
