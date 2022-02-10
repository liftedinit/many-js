import * as keys from "../keys";

describe("keys", () => {
  test("getSeedWords", () => {
    const seedWords = keys.getSeedWords();
    expect(seedWords.split(" ")).toHaveLength(12);
  });

  test("fromSeedWords", () => {
    const seedWords = keys.getSeedWords();
    const id1 = keys.fromSeedWords(seedWords);
    const id2 = keys.fromSeedWords(seedWords);
    expect(id1?.privateKey).toStrictEqual(id2?.privateKey);
  });

  test("fromPem", () => {
    const pem = `
-----BEGIN PRIVATE KEY-----
MC4CAQAwBQYDK2VwBCIEICT3i6WfLx4t3UF6R8aEfczyATc/jvqvOrNga2MJfA2R
-----END PRIVATE KEY-----
  `;
    const id = keys.fromPem(pem);
    expect(id).not.toBe(null);
  });
});
