import { tag } from "../../../message/cbor";

export const mockSymbolIdentity = [
  tag(
    10000,
    // todo: find out how to mock the symbol Identity
    // oqbfbahksdwaqeenayy2gxke32hgb7aq4ao4wt745lsfs6wiaaaaqnz
    Buffer.from([
      128, 74, 16, 29, 82, 29, 129, 2, 17, 160, 198, 52, 107, 168, 155, 209,
      204, 31, 130, 28, 3, 185, 105, 255, 157, 92, 139, 47, 89, 0, 0, 1,
    ])
  ),
  "abc",
];

export const mockSymbolIdentity2 = [
  // todo: find out how to mock the symbol Identity
  // "oaffbahksdwaqeenayy2gxke32hgb7aq4ao4wt745lsfs6wijp"
  tag(
    10000,
    Buffer.from([
      1, 74, 16, 29, 82, 29, 129, 2, 17, 160, 198, 52, 107, 168, 155, 209, 204,
      31, 130, 28, 3, 185, 105, 255, 157, 92, 139, 47, 89,
    ])
  ),
  "cba",
];

export const expectedSymbolsMap = {
  symbols: new Map([
    ["oaffbahksdwaqeenayy2gxke32hgb7aq4ao4wt745lsfs6wijp", "cba"],
    ["oqbfbahksdwaqeenayy2gxke32hgb7aq4ao4wt745lsfs6wiaaaaqnz", "abc"],
  ]),
};
