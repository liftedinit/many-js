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
} from "../../network"

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
  else if (eventTypeName === EventType.accountMultisigSetDefaults) {
    return await makeMultisigSetDefaultEventData(txn)
  }

  console.error("event type not implemented", indices, txn)
}

async function makeMultisigSetDefaultEventData(
  eventData: Map<number, unknown>,
): Promise<Omit<MultisigSetDefaultsEvent, "id" | "time">> {
  return {
    type: EventType.accountMultisigSetDefaults,
    submitter: await getAddressFromTaggedIdentity(
      eventData.get(1) as { value: Uint8Array },
    ),
    account: await getAddressFromTaggedIdentity(
      eventData.get(2) as { value: Uint8Array },
    ),
    threshold: eventData.get(3) as number,
    expireInSecs: eventData.get(4) as number,
    executeAutomatically: eventData.get(5) as boolean,
  }
}

async function makeCreateAccountEventData(eventData: Map<number, unknown>) {
  return {
    type: EventType.accountCreate,
    account: await getAddressFromTaggedIdentity(
      eventData.get(1) as { value: Uint8Array },
    ),
    ...makeAccountInfoData({
      description: eventData.get(2) as string,
      roles: eventData.get(3) as Map<{ value: Uint8Array }, string[]>,
      features: eventData.get(4) as AccountFeature[],
    }),
  }
}

async function makeAddFeaturesEventData(eventData: Map<number, unknown>) {
  const result: Omit<AddFeaturesEvent, "id" | "time"> = {
    type: EventType.accountAddFeatures,
    account: await getAddressFromTaggedIdentity(
      eventData.get(1) as { value: Uint8Array },
    ),
  }
  if (eventData.get(2) instanceof Map) {
    result.roles = getAccountRolesData(
      eventData.get(2) as Map<{ value: Uint8Array }, string[]>,
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
  roles: Map<{ value: Uint8Array }, string[]>
  features: AccountFeature[]
}) {
  return {
    description,
    roles: getAccountRolesData(roles),
    features: getAccountFeaturesData(features),
  }
}

export function getAccountRolesData(
  roles: Map<{ value: Uint8Array }, string[]> = new Map(),
): Map<string, string[]> | undefined {
  return Array.from(roles).reduce((acc, roleData) => {
    const [identity, roleList] = roleData
    const i = identity as { value: Uint8Array }
    const address = new Address(Buffer.from(i.value)).toString()
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
    account: await getAddressFromTaggedIdentity(
      eventData.get(1) as { value: Uint8Array },
    ),
    token: eventData.get(2) as ArrayBuffer,
    [actorType]: eventData.get(3)
      ? await getAddressFromTaggedIdentity(
          eventData.get(3) as { value: Uint8Array },
        )
      : "",
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
      from: await getAddressFromTaggedIdentity(
        eventData.get(0) as {
          value: Uint8Array
        },
      ),
      to: await getAddressFromTaggedIdentity(
        eventData.get(1) as {
          value: Uint8Array
        },
      ),
      symbolAddress: await getAddressFromTaggedIdentity(
        eventData.get(3) as {
          value: Uint8Array
        },
      ),
      amount: BigInt(eventData.get(2) as number),
    }
  }
  return {
    type: EventType.send,
    from: await getAddressFromTaggedIdentity(
      eventData.get(1) as {
        value: Uint8Array
      },
    ),
    to: await getAddressFromTaggedIdentity(
      eventData.get(2) as {
        value: Uint8Array
      },
    ),
    symbolAddress: await getAddressFromTaggedIdentity(
      eventData.get(3) as { value: Uint8Array },
    ),
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
  eventData: Map<number, unknown>,
): Promise<Omit<MultisigSubmitEvent, "id" | "time">> {
  const submittedTxn = eventData.get(4) as Map<number, unknown>
  const transaction = await makeTxnData(submittedTxn, {
    isTxnParamData: true,
  })

  return {
    type: EventType.accountMultisigSubmit,
    submitter: await getAddressFromTaggedIdentity(
      eventData.get(1) as { value: Uint8Array },
    ),
    account: await getAddressFromTaggedIdentity(
      eventData.get(2) as { value: Uint8Array },
    ),
    memo: eventData.get(3) as string,
    transaction,
    token: eventData.get(5) as ArrayBuffer,
    threshold: eventData.get(6) as number,
    expireDate: eventData.get(7) as Date,
    executeAutomatically: eventData.get(8) as boolean,
    data: eventData.get(9) as CborMap,
  }
}
