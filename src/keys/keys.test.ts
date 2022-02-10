import * as keys from "../keys";

describe("keys", () => {
  test("getSeedWords", () => {
    const seedWords = keys.getSeedWords();

    expect(seedWords.split(" ")).toHaveLength(12);
  });

  test("fromSeedWords", () => {
    const seedWords = keys.getSeedWords();
    const badWords = "abandon abandon abandon";

    const alice = keys.fromSeedWords(seedWords);
    const bob = keys.fromSeedWords(seedWords);

    expect(alice.privateKey).toStrictEqual(bob.privateKey);
    expect(() => {
      keys.fromSeedWords(badWords);
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

    const alice = keys.fromPem(pem);
    const bob = keys.fromPem(pem);

    expect(alice.privateKey).toStrictEqual(bob.privateKey);
    expect(() => {
      keys.fromPem(badPem);
    }).toThrow();
  });
});
