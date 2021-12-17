import * as identity from "./identity";

describe("identity", () => {
  test("getSeedWords", () => {
    const seedWords = identity.getSeedWords();
    expect(seedWords.split(" ")).toHaveLength(12);
  });

  test("fromSeedWords", () => {
    const seedWords = identity.getSeedWords();
    const id1 = identity.fromSeedWords(seedWords);
    const id2 = identity.fromSeedWords(seedWords);
    expect(id1?.privateKey).toStrictEqual(id2?.privateKey);
  });

  test("fromPem", () => {
    const pem = `
-----BEGIN PRIVATE KEY-----
MC4CAQAwBQYDK2VwBCIEICT3i6WfLx4t3UF6R8aEfczyATc/jvqvOrNga2MJfA2R
-----END PRIVATE KEY-----
  `;
    const id = identity.fromPem(pem);
    expect(id).not.toBe(null);
  });

  test("toString", () => {
    const id = identity.fromSeedWords(identity.getSeedWords());
    const idString = identity.toString(id);
    expect(idString).not.toBe(null);
  });

  test("toHex", () => {
    const id = identity.fromSeedWords(identity.getSeedWords());
    const idString = identity.toHex(id);
    expect(idString).not.toBe(null);
  });

  test("toCoseKey", () => {
    const id = identity.fromSeedWords(identity.getSeedWords());
    const idString = identity.toCoseKey(id);
    expect(idString).not.toBe(null);
  });
});
