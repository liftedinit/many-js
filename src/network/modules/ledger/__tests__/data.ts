import { Address } from "../../../../identity"
import { tag } from "../../../../message/cbor"
import { ONE_MINUTE, transactionTypeIndices } from "../../../../const"
import { LedgerTransactionType, TransactionTypeIndices } from "../../types"
import {
  accountSource,
  Address1,
  Address2,
  identityStr1,
  identityStr2,
  makeLedgerSendParamResponse,
  makeMockResponseMessage,
  txnSymbolAddress1,
  txnSymbolAddress2,
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

const txnTime1 = new Date()
const txnTime2 = new Date()
txnTime2.setMinutes(txnTime1.getMinutes() + 1)

const sendTxn1 = makeSendTxn({
  id: 1,
  time: txnTime1,
  source: identityStr1,
  destination: identityStr2,
  symbol: txnSymbolAddress1,
  amount: 1,
})

const sendTxn2 = makeSendTxn({
  id: 2,
  time: txnTime2,
  source: identityStr1,
  destination: identityStr2,
  symbol: txnSymbolAddress2,
  amount: 2,
})

export const mockLedgeListResponseMessage = makeLedgerListResponseMessage(10, [
  sendTxn1,
  sendTxn2,
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

export function makeMultisigSubmitTxnResponse({
  id,
  txnTypeIndices = transactionTypeIndices.accountMultisigSubmit,
  submitter,
  accountSource,
  memo = "",
  submittedTxn,
  token = new Uint8Array(),
  threshold,
  execute_automatically = false,
  cborData,
  timeout = new Date(new Date().getTime() + ONE_MINUTE),
  time,
}: {
  id: number
  txnTypeIndices?: TransactionTypeIndices
  submitter: string
  accountSource: string
  memo?: string
  submittedTxn: Map<number, unknown>
  token?: ArrayBuffer
  threshold: number
  execute_automatically: boolean
  cborData?: Map<number, unknown>
  timeout?: Date
  time: Date
}) {
  const m = new Map()
  m.set(0, txnTypeIndices)
    .set(1, tag(10000, Address.fromString(submitter).toBuffer()))
    .set(2, tag(10000, Address.fromString(accountSource).toBuffer()))
    .set(3, memo)
    .set(4, submittedTxn)
    .set(5, token)
    .set(6, threshold)
    .set(7, timeout)
    .set(8, execute_automatically)
    .set(9, cborData)

  return makeTxn({ id, time, txnData: m })
}

export function makeTxn({
  id,
  time,
  txnData,
}: {
  id: number
  time: Date
  txnData: Map<number, unknown>
}) {
  return new Map().set(0, id).set(1, time).set(2, txnData)
}

function makeSendTxn({
  id,
  time = new Date(),
  source,
  destination,
  symbol,
  amount,
}: {
  id: number
  time?: Date
  source: string
  destination: string
  symbol: string
  amount: number
}) {
  const m = new Map()
  m.set(0, transactionTypeIndices.send)
    .set(1, tag(10000, Address.fromString(source).toBuffer()))
    .set(2, tag(10000, Address.fromString(destination).toBuffer()))
    .set(3, tag(10000, Address.fromString(symbol).toBuffer()))
    .set(4, amount)

  return makeTxn({ id, time, txnData: m })
}

function makeLedgerListResponseMessage(count: number, transactions: unknown[]) {
  return makeMockResponseMessage(new Map().set(0, count).set(1, transactions))
}

const timeout = new Date(new Date().getTime() + ONE_MINUTE)
export const mockLedgerListMultisigSubmitTxnResponse =
  makeLedgerListResponseMessage(1, [
    makeMultisigSubmitTxnResponse({
      time: txnTime1,
      id: 1,
      submitter: identityStr2,
      accountSource,
      threshold: 2,
      memo: "this is a memo",
      execute_automatically: false,
      timeout,
      submittedTxn: new Map().set(0, transactionTypeIndices.send).set(
        1,
        makeLedgerSendParamResponse({
          source: accountSource,
          destination: identityStr1,
          symbol: txnSymbolAddress1,
          amount: 2,
        }),
      ),
    }),
  ])

export const expectedMockLedgerListMultisigSubmitTxnResponse = {
  count: 1,
  transactions: [
    {
      id: 1,
      time: txnTime1,
      type: LedgerTransactionType.accountMultisigSubmit,
      submitter: identityStr2,
      account: accountSource,
      memo: "this is a memo",
      token: new Uint8Array(),
      timeout,
      threshold: 2,
      execute_automatically: false,
      transaction: {
        type: LedgerTransactionType.send,
        from: accountSource,
        to: identityStr1,
        symbolAddress: txnSymbolAddress1,
        amount: BigInt(2),
      },
    },
  ],
}
