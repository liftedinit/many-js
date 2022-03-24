import { Identity } from "../../../../identity"
import { tag } from "../../../../message/cbor"

const identityStr1 = "oqbfbahksdwaqeenayy2gxke32hgb7aq4ao4wt745lsfs6wiaaaaqnz"
const Identity1 = Identity.fromString(identityStr1).toBuffer()
const identityStr2 = "oaffbahksdwaqeenayy2gxke32hgb7aq4ao4wt745lsfs6wijp"
const Identity2 = Identity.fromString(identityStr2).toBuffer()

export const mockSymbolIdentity = [tag(10000, Identity1), "abc"]

export const mockSymbolIdentity2 = [tag(10000, Identity2), "cba"]

export const expectedSymbolsMap = {
  symbols: new Map([
    [identityStr2, "cba"],
    [identityStr1, "abc"],
  ]),
}
