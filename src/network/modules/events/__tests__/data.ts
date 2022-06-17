import { Address } from "../../../../identity"
import { tag } from "../../../../message/cbor"
import { ONE_MINUTE, eventTypeNameToIndices } from "../../../../const"
import {
  AccountFeature,
  AccountFeatureTypes,
  AccountMultisigArgument,
  AccountRole,
  EventType,
  EventTypeIndices,
} from "../../types"
import {
  accountSource,
  identityStr1,
  identityStr2,
  identityStr3,
  makeLedgerSendParamResponse,
  makeMockResponseMessage,
  txnSymbolAddress1,
  txnSymbolAddress2,
} from "../../test/test-utils"

export const mockEventInfoResponseMessage = makeMockResponseMessage(
  new Map()
    .set(0, 5)
    .set(1, [
      eventTypeNameToIndices[EventType.send],
      eventTypeNameToIndices[EventType.accountCreate],
    ]),
)

export const expectedMockEventInfoResponse = {
  count: 5,
  events: [EventType.send, EventType.accountCreate],
}

const eventTime1 = new Date()
const eventTime2 = new Date()
eventTime2.setMinutes(eventTime1.getMinutes() + 1)

const sendTxn1 = makeSendTxn({
  id: 1,
  time: eventTime1,
  source: identityStr1,
  destination: identityStr2,
  symbol: txnSymbolAddress1,
  amount: 1,
})

const sendTxn2 = makeSendTxn({
  id: 2,
  time: eventTime2,
  source: identityStr1,
  destination: identityStr2,
  symbol: txnSymbolAddress2,
  amount: 2,
})

export const mockEventsListSendTxnResponseMessage =
  makeEventsListResponseMessage(10, [sendTxn1, sendTxn2])

export const expectedMockEventsListSendResponse = {
  count: 10,
  events: [
    {
      id: 1,
      time: eventTime1,
      type: "send",
      from: identityStr1,
      to: identityStr2,
      symbolAddress: txnSymbolAddress1,
      amount: BigInt(1),
    },
    {
      id: 2,
      time: eventTime2,
      type: "send",
      from: identityStr1,
      to: identityStr2,
      symbolAddress: txnSymbolAddress2,
      amount: BigInt(2),
    },
  ],
}

function makeMultisigSubmitTxnResponse({
  id,
  txnTypeIndices = eventTypeNameToIndices.accountMultisigSubmit,
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
  txnTypeIndices?: EventTypeIndices
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

function makeMultisigTxnResponse({
  id,
  txnTypeIndices,
  accountSource,
  actor = "",
  token = new Uint8Array(),
  time,
}: {
  id: number
  txnTypeIndices?: EventTypeIndices
  accountSource: string
  token?: ArrayBuffer
  actor: string
  time: Date
}) {
  const m = new Map()
    .set(2, token)
    .set(3, tag(10000, Address.fromString(actor).toBuffer()))

  return makeTxn({
    id,
    time,
    txnData: makeAccountTxnResponse({
      txnTypeIndices,
      accountSource,
      txnData: m,
    }),
  })
}

function makeTxn({
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
  m.set(0, eventTypeNameToIndices.send)
    .set(1, tag(10000, Address.fromString(source).toBuffer()))
    .set(2, tag(10000, Address.fromString(destination).toBuffer()))
    .set(3, tag(10000, Address.fromString(symbol).toBuffer()))
    .set(4, amount)

  return makeTxn({ id, time, txnData: m })
}

function makeEventsListResponseMessage(count: number, events: unknown[]) {
  return makeMockResponseMessage(new Map().set(0, count).set(1, events))
}

const timeout = new Date(new Date().getTime() + ONE_MINUTE)
export const mockEventsListMultisigSubmitTxnResponse =
  makeEventsListResponseMessage(1, [
    makeMultisigSubmitTxnResponse({
      time: eventTime1,
      id: 1,
      submitter: identityStr2,
      accountSource,
      threshold: 2,
      memo: "this is a memo",
      execute_automatically: false,
      timeout,
      submittedTxn: new Map().set(0, eventTypeNameToIndices.send).set(
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
export const expectedMockEventsListMultisigSubmitTxnResponse = {
  count: 1,
  events: [
    {
      id: 1,
      time: eventTime1,
      type: EventType.accountMultisigSubmit,
      submitter: identityStr2,
      account: accountSource,
      memo: "this is a memo",
      token: new Uint8Array(),
      timeout,
      threshold: 2,
      execute_automatically: false,
      transaction: {
        type: EventType.send,
        from: accountSource,
        to: identityStr1,
        symbolAddress: txnSymbolAddress1,
        amount: BigInt(2),
      },
    },
  ],
}

export const mockEventsListMultisigTxnsResponse = makeEventsListResponseMessage(
  4,
  [
    makeMultisigTxnResponse({
      txnTypeIndices: eventTypeNameToIndices.accountMultisigApprove,
      time: eventTime1,
      id: 4,
      accountSource,
      actor: identityStr2,
    }),
    makeMultisigTxnResponse({
      txnTypeIndices: eventTypeNameToIndices.accountMultisigRevoke,
      time: eventTime1,
      id: 3,
      accountSource,
      actor: identityStr2,
    }),
    makeMultisigTxnResponse({
      txnTypeIndices: eventTypeNameToIndices.accountMultisigExecute,
      time: eventTime1,
      id: 2,
      accountSource,
      actor: identityStr2,
    }),
    makeMultisigTxnResponse({
      txnTypeIndices: eventTypeNameToIndices.accountMultisigWithdraw,
      time: eventTime1,
      id: 1,
      accountSource,
      actor: identityStr2,
    }),
  ],
)

export const expectedMockEventsListMultisigTxnsResponse = {
  count: 4,
  events: [
    {
      id: 4,
      time: eventTime1,
      type: EventType.accountMultisigApprove,
      account: accountSource,
      token: new Uint8Array(),
      approver: identityStr2,
    },
    {
      id: 3,
      time: eventTime1,
      type: EventType.accountMultisigRevoke,
      account: accountSource,
      token: new Uint8Array(),
      revoker: identityStr2,
    },
    {
      id: 2,
      time: eventTime1,
      type: EventType.accountMultisigExecute,
      account: accountSource,
      token: new Uint8Array(),
      executor: identityStr2,
    },
    {
      id: 1,
      time: eventTime1,
      type: EventType.accountMultisigWithdraw,
      account: accountSource,
      token: new Uint8Array(),
      withdrawer: identityStr2,
    },
  ],
}

const roles = new Map()
roles.set(identityStr2, [AccountRole.owner, AccountRole.canMultisigSubmit])
roles.set(identityStr1, [AccountRole.canMultisigApprove])
roles.set(identityStr3, [AccountRole.canMultisigApprove])

const _roles = Array.from(roles).reduce((acc, rolesForAddress) => {
  const [address, roleList] = rolesForAddress
  const bytes = Address.fromString(address).toBuffer()
  acc.set({ value: bytes }, roleList)
  return acc
}, new Map())

export const mockEventsListCreateAccountResponse =
  makeEventsListResponseMessage(1, [
    makeAccountCreateTxnResponse({
      id: 1,
      time: eventTime1,
      accountSource,
      accountName: "Test Account Name",
    }),
  ])

function makeAccountCreateTxnResponse({
  id,
  time,
  accountName,
  accountSource,
}: {
  id: number
  time: Date
  accountName: string
  accountSource: string
}) {
  const features: AccountFeature[] = [
    [
      AccountFeatureTypes.accountMultisig,
      new Map()
        .set(AccountMultisigArgument.threshold, 2)
        .set(AccountMultisigArgument.timeout_in_secs, 86400)
        .set(AccountMultisigArgument.execute_automatically, false),
    ],
  ]
  const m = new Map().set(2, accountName).set(3, _roles).set(4, features)
  return makeTxn({
    id,
    time,
    txnData: makeAccountTxnResponse({
      txnTypeIndices: eventTypeNameToIndices.accountCreate,
      accountSource,
      txnData: m,
    }),
  })
}

export const expectedMockEventsListCreateAccountResponse = {
  count: 1,
  events: [
    {
      id: 1,
      time: eventTime1,
      type: EventType.accountCreate,
      name: "Test Account Name",
      account: accountSource,
      roles,
      features: new Map([
        [
          AccountFeatureTypes[1],
          new Map()
            .set(AccountMultisigArgument[AccountMultisigArgument.threshold], 2)
            .set(
              AccountMultisigArgument[AccountMultisigArgument.timeout_in_secs],
              86400,
            )
            .set(
              AccountMultisigArgument[
                AccountMultisigArgument.execute_automatically
              ],
              false,
            ),
        ],
      ]),
    },
  ],
}
function makeAccountTxnResponse({
  txnTypeIndices,
  accountSource,
  txnData,
}: {
  txnTypeIndices?: EventTypeIndices
  txnData: Map<number, unknown>
  accountSource: string
}) {
  let m = new Map()
    .set(0, txnTypeIndices)
    .set(1, tag(10000, Address.fromString(accountSource).toBuffer()))
  m = new Map([...m, ...txnData])
  return m
}
