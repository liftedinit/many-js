import { Address } from "../../../../identity"
import cbor from "cbor"
import { tag } from "../../../../message/cbor"
import { Message } from "../../../../message"

const identityStr1 = "mqbfbahksdwaqeenayy2gxke32hgb7aq4ao4wt745lsfs6wiaaaaqnz"
const Address1 = Address.fromString(identityStr1).toBuffer()
const identityStr2 = "maffbahksdwaqeenayy2gxke32hgb7aq4ao4wt745lsfs6wijp"
const Address2 = Address.fromString(identityStr2).toBuffer()

export const mockSymbolAddress = [tag(10000, Address1), "abc"]

export const mockSymbolAddress2 = [tag(10000, Address2), "cba"]

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
          new Map([mockSymbolAddress, mockSymbolAddress2]),
        ],
      ]),
    ),
  ],
])

export const mockLedgerInfoResponseMessage = new Message(
  mockLedgerInfoResponseContent,
)

export const mockSymbolBalance = [tag(10000, Address1), 1000000]
export const mockSymbolBalance2 = [tag(10000, Address2), 5000000]

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

const txnSymbolAddress1 = "oafw3bxrqe2jdcidvjlonloqcczvytrxr3fl4naybmign3uy6e"
const txnSymbolAddress2 = "oafxombm6axwsrcvymht5ss3chlpbks7sp7dvl2v7chnuzkyfj"
const txnTime1 = new Date()
const txnTime2 = new Date()
txnTime2.setMinutes(txnTime1.getMinutes() + 1)
export const mockLedgerListResponseContent = new Map([
  [
    4,
    cbor.encode(
      // @ts-ignore
      new Map([
        [0, 10],
        [
          1,
          [
            // @ts-ignore
            new Map([
              [0, 1],
              [1, txnTime1],
              [
                2,
                //@ts-ignore
                new Map([
                  [0, 0],
                  [1, tag(10000, Address1)],
                  [2, tag(10000, Address2)],
                  [3, txnSymbolAddress1],
                  [4, 1],
                ]),
              ],
            ]),
            // @ts-ignore
            new Map([
              [0, 2],
              [1, txnTime2],
              [
                2,
                //@ts-ignore
                new Map([
                  [0, 0],
                  [1, tag(10000, Address1)],
                  [2, tag(10000, Address2)],
                  [3, txnSymbolAddress2],
                  [4, 2],
                ]),
              ],
            ]),
          ],
        ],
      ]),
    ),
  ],
])

export const expectedListResponse = {
  count: 10,
  transactions: [
    {
      id: 1,
      time: txnTime1,
      type: "send",
      from: identityStr1,
      to: identityStr2,
      symbolAddress: txnSymbolAddress1,
      amount: BigInt(1),
    },
    {
      id: 2,
      time: txnTime2,
      type: "send",
      from: identityStr1,
      to: identityStr2,
      symbolAddress: txnSymbolAddress2,
      amount: BigInt(2),
    },
  ],
}

export const mockLedgeListResponseMessage = new Message(
  mockLedgerListResponseContent,
)
