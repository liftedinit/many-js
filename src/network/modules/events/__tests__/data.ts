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
  taggedIdentity2,
  taggedAccountSource,
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

const eventTime1 = new Date().getTime()
const eventTime2 = eventTime1 + 60000

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
  executeAutomatically = false,
  cborData,
  expireDate = new Date(new Date().getTime() + ONE_MINUTE).getTime(),
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
  executeAutomatically: boolean
  cborData?: Map<number, unknown>
  expireDate?: number
  time: number
}) {
  const m = new Map()
  m.set(0, txnTypeIndices)
    .set(1, tag(10000, Address.fromString(submitter).toBuffer()))
    .set(2, tag(10000, Address.fromString(accountSource).toBuffer()))
    .set(3, memo)
    .set(4, submittedTxn)
    .set(5, token)
    .set(6, threshold)
    .set(7, tag(1, expireDate))
    .set(8, executeAutomatically)
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
  time: number
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
  time: number
  txnData: Map<number, unknown>
}) {
  return new Map().set(0, id).set(1, tag(1, time)).set(2, txnData)
}

function makeSendTxn({
  id,
  time = new Date().getTime(),
  source,
  destination,
  symbol,
  amount,
}: {
  id: number
  time?: number
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

const expireDate = new Date(new Date().getTime() + ONE_MINUTE).getTime()
export const mockEventsListMultisigSubmitEventResponse =
  makeEventsListResponseMessage(1, [
    makeMultisigSubmitTxnResponse({
      time: eventTime1,
      id: 1,
      submitter: identityStr2,
      accountSource,
      threshold: 2,
      memo: "this is a memo",
      executeAutomatically: false,
      expireDate,
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
export const expectedMockEventsListMultisigSubmitEventResponse = {
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
      expireDate,
      threshold: 2,
      executeAutomatically: false,
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
  9,
  [
    makeTxn({
      id: 9,
      time: eventTime1,
      txnData: new Map()
        .set(0, eventTypeNameToIndices.accountAddRoles)
        .set(1, taggedAccountSource)
        .set(
          2,
          new Map().set(taggedIdentity2, [
            AccountRole[AccountRole.canMultisigSubmit],
          ]),
        ),
    }),
    makeTxn({
      id: 8,
      time: eventTime1,
      txnData: new Map()
        .set(0, eventTypeNameToIndices.accountAddRoles)
        .set(1, taggedAccountSource)
        .set(
          2,
          new Map().set(taggedIdentity2, [
            AccountRole[AccountRole.canMultisigApprove],
          ]),
        ),
    }),
    makeTxn({
      id: 7,
      time: eventTime1,
      txnData: new Map()
        .set(0, eventTypeNameToIndices.accountSetDescription)
        .set(1, taggedAccountSource)
        .set(2, "this is the new description"),
    }),
    makeTxn({
      id: 6,
      time: eventTime1,
      txnData: new Map()
        .set(0, eventTypeNameToIndices.accountAddFeatures)
        .set(1, taggedAccountSource)
        .set(
          2,
          new Map().set(taggedIdentity2, [
            AccountRole[AccountRole.canMultisigApprove],
          ]),
        )
        .set(3, [
          AccountFeatureTypes.accountLedger,
          [
            AccountFeatureTypes.accountMultisig,
            new Map()
              .set(AccountMultisigArgument.threshold, 2)
              .set(AccountMultisigArgument.expireInSecs, 3600)
              .set(AccountMultisigArgument.executeAutomatically, false),
          ],
        ]),
    }),
    makeTxn({
      id: 5,
      time: eventTime1,
      txnData: new Map()
        .set(0, eventTypeNameToIndices.accountMultisigSetDefaults)
        .set(1, taggedIdentity2)
        .set(2, taggedAccountSource)
        .set(3, 2)
        .set(4, 86400)
        .set(5, true),
    }),
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
  count: 9,
  events: [
    {
      id: 9,
      time: eventTime1,
      type: EventType.accountAddRoles,
      account: accountSource,
      roles: new Map().set(identityStr2, [
        AccountRole[AccountRole.canMultisigSubmit],
      ]),
    },
    {
      id: 8,
      time: eventTime1,
      type: EventType.accountAddRoles,
      account: accountSource,
      roles: new Map().set(identityStr2, [
        AccountRole[AccountRole.canMultisigApprove],
      ]),
    },
    {
      id: 7,
      time: eventTime1,
      type: EventType.accountSetDescription,
      account: accountSource,
      description: "this is the new description",
    },
    {
      id: 6,
      time: eventTime1,
      type: EventType.accountAddFeatures,
      account: accountSource,
      roles: new Map().set(identityStr2, [
        AccountRole[AccountRole.canMultisigApprove],
      ]),
      features: new Map()
        .set(AccountFeatureTypes[AccountFeatureTypes.accountLedger], true)
        .set(
          AccountFeatureTypes[AccountFeatureTypes.accountMultisig],
          new Map()
            .set(AccountMultisigArgument[AccountMultisigArgument.threshold], 2)
            .set(
              AccountMultisigArgument[AccountMultisigArgument.expireInSecs],
              3600,
            )
            .set(
              AccountMultisigArgument[
                AccountMultisigArgument.executeAutomatically
              ],
              false,
            ),
        ),
    },
    {
      id: 5,
      time: eventTime1,
      type: EventType.accountMultisigSetDefaults,
      account: accountSource,
      submitter: identityStr2,
      threshold: 2,
      expireInSecs: 86400,
      executeAutomatically: true,
    },
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
  const bytes = tag(10000, Address.fromString(address).toBuffer())
  acc.set(bytes, roleList)
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
  time: number
  accountName: string
  accountSource: string
}) {
  const features: AccountFeature[] = [
    [
      AccountFeatureTypes.accountMultisig,
      new Map()
        .set(AccountMultisigArgument.threshold, 2)
        .set(AccountMultisigArgument.expireInSecs, 86400)
        .set(AccountMultisigArgument.executeAutomatically, false),
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
      description: "Test Account Name",
      account: accountSource,
      roles,
      features: new Map([
        [
          AccountFeatureTypes[1],
          new Map()
            .set(AccountMultisigArgument[AccountMultisigArgument.threshold], 2)
            .set(
              AccountMultisigArgument[AccountMultisigArgument.expireInSecs],
              86400,
            )
            .set(
              AccountMultisigArgument[
                AccountMultisigArgument.executeAutomatically
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
