import { Identity } from "../identity";

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
    return Identity.fromBuffer(bytes);
  }

  test("can read anonymous", () => {
    const anon = new Identity();
    const anonStr = anon.toString();

    expect(anon).toStrictEqual(Identity.fromString(anonStr));
  });

  test("byte array conversion", () => {
    const anon = new Identity();
    const alice = id(1);
    const bob = id(2);

    expect(anon.toString()).not.toStrictEqual(alice.toString());
    expect(alice.toString()).not.toStrictEqual(bob.toString());

    expect(anon.toBuffer()).not.toStrictEqual(alice.toBuffer());
    expect(alice.toBuffer()).not.toStrictEqual(bob.toBuffer());

    expect(Identity.fromString(anon.toString())).toStrictEqual(anon);
    expect(Identity.fromString(alice.toString())).toStrictEqual(alice);
    expect(Identity.fromString(bob.toString())).toStrictEqual(bob);
  });

  test("textual format 1", () => {
    const alice = Identity.fromString(
      "oahek5lid7ek7ckhq7j77nfwgk3vkspnyppm2u467ne5mwiqys"
    );
    const bob = Identity.fromHex(
      "01c8aead03f915f128f0fa7ff696c656eaa93db87bd9aa73df693acb22"
    );

    expect(alice).toStrictEqual(bob);
  });

  test("textual format 2", () => {
    const alice = Identity.fromString(
      "oqbfbahksdwaqeenayy2gxke32hgb7aq4ao4wt745lsfs6wiaaaaqnz"
    );
    const bob = Identity.fromHex(
      "804a101d521d810211a0c6346ba89bd1cc1f821c03b969ff9d5c8b2f59000001"
    );

    expect(alice).toStrictEqual(bob);
  });

  test("subresource 1", () => {
    const alice = Identity.fromString(
      "oahek5lid7ek7ckhq7j77nfwgk3vkspnyppm2u467ne5mwiqys"
    ).withSubresource(1);
    const bob = Identity.fromHex(
      "80c8aead03f915f128f0fa7ff696c656eaa93db87bd9aa73df693acb22000001"
    );
    const charlie = Identity.fromHex(
      "80c8aead03f915f128f0fa7ff696c656eaa93db87bd9aa73df693acb22000002"
    );

    expect(alice).toStrictEqual(bob);
    expect(bob.withSubresource(2)).toStrictEqual(charlie);
  });
});
