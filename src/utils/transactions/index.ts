import { eventTypeNameToIndices } from "../../const"
import { Address } from "../../identity"
import { CborMap } from "../../message/cbor"
import {
  LedgerSendParam,
  EventType,
  MakeTxnDataOpts,
  MultisigSubmitEvent,
  SendEvent,
  Event,
  EventTypeIndices,
  MultisigEvent,
  AccountFeatureTypes,
  AccountFeature,
  AccountMultisigArgument,
  MultisigSetDefaultsEvent,
  AddFeaturesEvent,
  Memo,
  MintEvent,
  BurnEvent,
  TokenCreateEvent,
} from "../../network"
import { TokenInfoSummary } from "../../network/modules/tokens/types"
import { AttributeRelatedIndex } from "../../network/modules/events/events"

export function makeLedgerSendParam({
  from,
  to,
  symbol,
  amount,
}: LedgerSendParam) {
  const m = new Map()
  from && m.set(0, from)
  return m.set(1, to).set(2, amount).set(3, symbol)
}

export async function getEventTypeNameFromIndices(
  indices: EventTypeIndices,
): Promise<EventType | undefined> {
  const indicesJson = JSON.stringify(indices)

  for (let k of Object.keys(eventTypeNameToIndices)) {
    const val = JSON.stringify(eventTypeNameToIndices[k as EventType])
    if (indicesJson === val) {
      return k as EventType
    }
  }
}

export async function makeTxnData(
  txn: Map<number, unknown>,
  opts?: MakeTxnDataOpts,
): Promise<Omit<Event, "id" | "time"> | undefined> {
  const indices = txn.get(0) as EventTypeIndices
  const eventTypeName = await getEventTypeNameFromIndices(indices)

  if (eventTypeName === EventType.send)
    return await makeSendEventData(txn, opts)
  else if (eventTypeName === EventType.accountCreate) {
    return await makeCreateAccountEventData(txn)
  } else if (eventTypeName === EventType.accountAddFeatures) {
    return await makeAddFeaturesEventData(txn)
  } else if (eventTypeName === EventType.accountSetDescription) {
    return await makeSetDescriptionEventData(txn)
  } else if (
    eventTypeName === EventType.accountAddRoles ||
    eventTypeName === EventType.accountRemoveRoles
  ) {
    return await makeEditRolesEventData(txn, eventTypeName)
  } else if (eventTypeName === EventType.accountMultisigSubmit)
    return await makeMultisigSubmitEventData(txn)
  else if (eventTypeName === EventType.accountMultisigApprove)
    return await makeMultisigEventData(
      EventType.accountMultisigApprove,
      "approver",
      txn,
    )
  else if (eventTypeName === EventType.accountMultisigRevoke)
    return await makeMultisigEventData(
      EventType.accountMultisigRevoke,
      "revoker",
      txn,
    )
  else if (eventTypeName === EventType.accountMultisigExecute)
    return await makeMultisigEventData(
      EventType.accountMultisigExecute,
      "executor",
      txn,
    )
  else if (eventTypeName === EventType.accountMultisigWithdraw)
    return await makeMultisigEventData(
      EventType.accountMultisigWithdraw,
      "withdrawer",
      txn,
    )
  else if (eventTypeName === EventType.accountMultisigSetDefaults)
    return await makeMultisigSetDefaultEventData(txn)
  else if (eventTypeName === EventType.mint) return await makeMintEventData(txn)
  else if (eventTypeName === EventType.burn) return await makeBurnEventData(txn)
  else if (eventTypeName === EventType.tokenCreate)
    return await makeTokenCreateEventData(txn)

  console.error("event type not implemented", indices, txn)
}

async function makeSetDescriptionEventData(eventData: Map<number, unknown>) {
  return {
    type: EventType.accountSetDescription,
    account: (eventData.get(1) as Address)?.toString(),
    description: eventData.get(2),
  }
}

async function makeEditRolesEventData(
  eventData: Map<number, unknown>,
  eventTypeName: EventType,
) {
  const res = {
    type: eventTypeName,
    account: (eventData.get(1) as Address)?.toString(),
    roles: getAccountRolesData(eventData.get(2) as Map<Address, string[]>),
  }
  return res
}

async function makeMultisigSetDefaultEventData(
  eventData: Map<number, unknown>,
): Promise<Omit<MultisigSetDefaultsEvent, "id" | "time">> {
  return {
    type: EventType.accountMultisigSetDefaults,
    submitter: (eventData.get(1) as Address)?.toString()!,
    account: (eventData.get(2) as Address)?.toString()!,
    threshold: eventData.get(3) as number,
    expireInSecs: eventData.get(4) as number,
    executeAutomatically: eventData.get(5) as boolean,
  }
}

async function makeCreateAccountEventData(eventData: Map<number, unknown>) {
  return {
    type: EventType.accountCreate,
    account: (eventData.get(1) as Address)?.toString(),
    ...makeAccountInfoData({
      description: eventData.get(2) as string,
      roles: eventData.get(3) as Map<Address, string[]>,
      features: eventData.get(4) as AccountFeature[],
    }),
  }
}

async function makeAddFeaturesEventData(eventData: Map<number, unknown>) {
  const result: Omit<AddFeaturesEvent, "id" | "time"> = {
    type: EventType.accountAddFeatures,
    account: (eventData.get(1) as Address)?.toString()!,
  }
  if (eventData.get(2) instanceof Map) {
    result.roles = getAccountRolesData(
      eventData.get(2) as Map<Address, string[]>,
    )
  }
  if (eventData.get(3) instanceof Array) {
    result.features = getAccountFeaturesData(
      eventData.get(3) as AccountFeature[],
    )
  }
  return result
}

export function makeAccountInfoData({
  description,
  roles,
  features,
}: {
  description: string
  roles: Map<Address, string[]>
  features: AccountFeature[]
}) {
  return {
    description,
    roles: getAccountRolesData(roles),
    features: getAccountFeaturesData(features),
  }
}

export function getAccountRolesData(
  roles: Map<Address, string[]> = new Map(),
): Map<string, string[]> | undefined {
  return Array.from(roles).reduce((acc, roleData) => {
    const [identity, roleList] = roleData
    const address = identity?.toString()
    if (Array.isArray(roleList) && roleList.length) {
      acc.set(address, roleList)
    }
    return acc
  }, new Map())
}

export function getAccountFeaturesData(
  features: AccountFeature[] = [],
): Map<string, boolean | Map<string, unknown>> {
  return features.reduce((acc, feature) => {
    let featureName
    let featureValue
    let featureLabelNum
    if (Array.isArray(feature)) {
      const [featureLabelNum, featureArguments] = feature as [number, unknown]
      featureName = AccountFeatureTypes[featureLabelNum]
      featureValue = makeAccountFeatureArgumentData(
        featureLabelNum,
        featureArguments as Map<number, unknown>,
      )
    } else if (typeof feature === "number") {
      featureLabelNum = feature
      featureName = AccountFeatureTypes[feature]
      featureValue = true
    }
    if (!featureName && featureLabelNum)
      console.error("Account feature not implemented:", featureLabelNum)
    if (featureName && featureValue) acc.set(featureName, featureValue)
    return acc
  }, new Map())
}

function makeAccountFeatureArgumentData(
  feature: number,
  argumentData: Map<number, unknown> = new Map(),
): Map<AccountMultisigArgument, unknown> | undefined {
  if (feature === AccountFeatureTypes.accountMultisig) {
    return Array.from(argumentData).reduce((acc, argData) => {
      const [argLabelNum, value] = argData
      const argName = AccountMultisigArgument[argLabelNum]
      if (!argName) {
        console.error(
          "Account multisig feature argument not found:",
          argLabelNum,
        )
        return acc
      } else acc.set(argName, value)
      return acc
    }, new Map())
  }
}

async function makeMultisigEventData(
  type: EventType,
  actorType: "approver" | "revoker" | "executor" | "withdrawer",
  eventData: Map<number, unknown>,
): Promise<Omit<MultisigEvent, "id" | "time">> {
  return {
    type,
    account: (eventData.get(1) as Address)?.toString()!,
    token: eventData.get(2) as ArrayBuffer,
    [actorType]: (eventData.get(3) as Address)?.toString() ?? "",
  }
}

async function makeSendEventData(
  eventData: Map<number, unknown>,
  opts?: MakeTxnDataOpts,
): Promise<Omit<SendEvent, "id" | "time">> {
  const { isTxnParamData } = opts || {}
  if (isTxnParamData) {
    eventData = eventData.get(1) as Map<number, unknown>
    return {
      type: EventType.send,
      from: (eventData.get(0) as Address)?.toString()!,
      to: (eventData.get(1) as Address)?.toString()!,
      symbolAddress: (eventData.get(3) as Address)?.toString()!,
      amount: BigInt(eventData.get(2) as number),
    }
  }
  return {
    type: EventType.send,
    from: (eventData.get(1) as Address)?.toString()!,
    to: (eventData.get(2) as Address)?.toString()!,
    symbolAddress: (eventData.get(3) as Address)?.toString()!,
    amount: BigInt(eventData.get(4) as number),
  }
}

export async function getAddressFromTaggedIdentity(taggedIdentity: {
  value: Uint8Array
}): Promise<string> {
  return new Address(taggedIdentity.value as Buffer).toString()
}

// https://github.com/liftedinit/many-rs/blob/main/src/many/src/types/ledger.rs#L658
async function makeMultisigSubmitEventData(
  eventData: CborMap,
): Promise<Omit<MultisigSubmitEvent, "id" | "time">> {
  const submittedTxn = eventData.get(4) as Map<number, unknown>
  const transaction = await makeTxnData(submittedTxn, {
    isTxnParamData: true,
  })

  return {
    type: EventType.accountMultisigSubmit,
    submitter: (eventData.get(1) as Address)?.toString()!,
    account: (eventData.get(2) as Address)?.toString()!,
    transaction,
    token: eventData.get(5) as ArrayBuffer,
    threshold: eventData.get(6) as number,
    expireDate: eventData.get(7)?.value,
    executeAutomatically: eventData.get(8) as boolean,
    memo: eventData.get(10) as Memo,
  }
}

async function makeMintEventData(
  eventData: CborMap,
): Promise<Omit<MintEvent, "id" | "time">> {
  const amounts = eventData.get(2) as Map<Address, number>
  return {
    type: EventType.mint,
    symbolAddress: (eventData.get(1) as Address)?.toString(),
    amounts: Array.from(amounts.entries()).reduce(
      (amts, [to, amt]) => ({ ...amts, [to.toString()]: BigInt(amt) }),
      {},
    ),
  }
}

async function makeBurnEventData(
  eventData: CborMap,
): Promise<Omit<BurnEvent, "id" | "time">> {
  const amounts = eventData.get(2) as Map<Address, number>
  return {
    type: EventType.burn,
    symbolAddress: (eventData.get(1) as Address)?.toString(),
    amounts: Array.from(amounts.entries()).reduce(
      (amts, [from, amt]) => ({ ...amts, [from.toString()]: BigInt(amt) }),
      {},
    ),
  }
}
async function makeTokenCreateEventData(
  eventData: CborMap,
): Promise<Omit<TokenCreateEvent, "id" | "time">> {
  const initialDistribution = eventData.get(4) as Map<Address, number>
  const summaryMap = eventData.get(1)
  const summary = {
    name: summaryMap.get(0),
    symbol: summaryMap.get(1),
    precision: summaryMap.get(2),
  } as TokenInfoSummary

  return {
    type: EventType.tokenCreate,
    summary,
    symbolAddress: (eventData.get(2) as Address).toString(),
    owner: (eventData.get(3) as Address)?.toString() || null,
    initialDistribution: Array.from(initialDistribution.entries()).reduce(
      (amts, [from, amt]) => ({ ...amts, [from.toString()]: BigInt(amt) }),
      {},
    ),
    extendedInfo: eventData.get(5) as AttributeRelatedIndex[],
    maximumSupply: eventData.get(6) as number,
    memo: eventData.get(7) as Memo,
  }
}
