import * as identity from "./identity";

describe("identity", () => {
  function id(seed: number) {
    // prettier-ignore
    const bytes = new Uint8Array([
      1,
      0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0,
      seed >> 24, seed >> 16, seed >> 8, seed & 0xff,
    ]);
    return identity.fromBuffer(bytes);
  }

  test("can read anonymous", () => {
    const anon = identity.anonymous();
    const anonStr = identity.toString(anon);

    expect(anon).toStrictEqual(identity.fromString(anonStr));
  });

  test("byte array conversion", () => {
    const anon = identity.anonymous();
    const alice = id(1);
    const bob = id(2);

    expect(identity.toString(anon)).not.toStrictEqual(identity.toString(alice));
    expect(identity.toString(alice)).not.toStrictEqual(identity.toString(bob));

    expect(identity.toBuffer(anon)).not.toStrictEqual(identity.toBuffer(alice));
    expect(identity.toBuffer(alice)).not.toStrictEqual(identity.toBuffer(bob));

    expect(identity.fromString(identity.toString(anon))).toStrictEqual(anon);
    expect(identity.fromString(identity.toString(alice))).toStrictEqual(alice);
    expect(identity.fromString(identity.toString(bob))).toStrictEqual(bob);
  });

  test("textual format 1", () => {
    const alice = identity.fromString(
      "oahek5lid7ek7ckhq7j77nfwgk3vkspnyppm2u467ne5mwiqys"
    );
    const bob = identity.fromHex(
      "01c8aead03f915f128f0fa7ff696c656eaa93db87bd9aa73df693acb22"
    );

    expect(alice).toStrictEqual(bob);
  });

  test("textual format 2", () => {
    const alice = identity.fromString(
      "oqbfbahksdwaqeenayy2gxke32hgb7aq4ao4wt745lsfs6wiaaaaqnz"
    );
    const bob = identity.fromHex(
      "804a101d521d810211a0c6346ba89bd1cc1f821c03b969ff9d5c8b2f59000001"
    );

    expect(alice).toStrictEqual(bob);
  });

  test("subresource 1", () => {
    const alice = identity.subresource(
      identity.fromString("oahek5lid7ek7ckhq7j77nfwgk3vkspnyppm2u467ne5mwiqys"),
      1
    );
    const bob = identity.fromHex(
      "80c8aead03f915f128f0fa7ff696c656eaa93db87bd9aa73df693acb22000001"
    );
    const charlie = identity.fromHex(
      "80c8aead03f915f128f0fa7ff696c656eaa93db87bd9aa73df693acb22000002"
    );

    expect(alice).toStrictEqual(bob);
    expect(identity.subresource(bob, 2)).toStrictEqual(charlie);
  });
});
