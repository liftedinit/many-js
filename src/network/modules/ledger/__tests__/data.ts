import { Identity } from "../../../../identity"
import cbor from "cbor"
import { tag } from "../../../../message/cbor"
import { Message } from "../../../../message"

const identityStr1 = "mqbfbahksdwaqeenayy2gxke32hgb7aq4ao4wt745lsfs6wiaaaaqnz"
const Identity1 = Identity.fromString(identityStr1).toBuffer()
const identityStr2 = "maffbahksdwaqeenayy2gxke32hgb7aq4ao4wt745lsfs6wijp"
const Identity2 = Identity.fromString(identityStr2).toBuffer()

export const mockSymbolIdentity = [tag(10000, Identity1), "abc"]

export const mockSymbolIdentity2 = [tag(10000, Identity2), "cba"]

export const expectedSymbolsMap = {
  symbols: new Map([
    [identityStr2, "cba"],
    [identityStr1, "abc"],
  ]),
}

export const mockLedgerInfoResponseContent = new Map([
  [
    4,
    cbor.encode(
      new Map([
        [
          4,
          // @ts-ignore
          new Map([mockSymbolIdentity, mockSymbolIdentity2]),
        ],
      ]),
    ),
  ],
])

export const mockLedgerInfoResponseMessage = new Message(
  mockLedgerInfoResponseContent,
)

export const mockSymbolBalance = [tag(10000, Identity1), 1000000]
export const mockSymbolBalance2 = [tag(10000, Identity2), 5000000]

export const mockLedgerBalanceResponseContent = new Map([
  [
    4,
    cbor.encode(
      new Map([
        [
          0,
          // @ts-ignore
          new Map([mockSymbolBalance, mockSymbolBalance2]),
        ],
      ]),
    ),
  ],
])
export const mockLedgerBalanceResponseMessage = new Message(
  mockLedgerBalanceResponseContent,
)
export const expectedBalancesMap = {
  balances: new Map([
    [identityStr1, 1000000],
    [identityStr2, 5000000],
  ]),
}
