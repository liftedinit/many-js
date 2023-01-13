import { tag } from "../../../../message/cbor"
import {
  Address1,
  Address2,
  identityStr1,
  identityStr2,
  makeMockResponseMessage,
} from "../../test/test-utils"

export const mockSymbolAddress = [tag(10000, Address1), "abc"]

export const mockSymbolAddress2 = [tag(10000, Address2), "cba"]

export const expectedSymbolsMap = {
  symbols: new Map([
    [identityStr2, "cba"],
    [identityStr1, "abc"],
  ]),
}

export const mockLedgerInfoResponseMessage = makeMockResponseMessage(
  new Map([
    [
      4,
      // @ts-ignore
      new Map([mockSymbolAddress, mockSymbolAddress2]),
    ],
  ]),
)

export const mockSymbolBalance = [tag(10000, Address1), 1000000]
export const mockSymbolBalance2 = [tag(10000, Address2), 5000000]

export const mockLedgerBalanceResponseMessage = makeMockResponseMessage(
  new Map([
    [
      0,
      // @ts-ignore
      new Map([mockSymbolBalance, mockSymbolBalance2]),
    ],
  ]),
)

export const expectedBalancesMap = {
  balances: new Map([
    [identityStr1, 1000000],
    [identityStr2, 5000000],
  ]),
}
