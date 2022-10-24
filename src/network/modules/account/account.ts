import { eventTypeNameToIndices } from "../../../const"
import { Address } from "../../../identity"
import { Message } from "../../../message"
import { CborMap } from "../../../message/cbor"
import {
  getAccountFeaturesData,
  getAccountRolesData,
  makeAccountInfoData,
  makeLedgerSendParam,
  makeRandomBytes,
  makeTxnData,
} from "../../../utils"
import { Event } from "../events"
import {
  AccountInfoPayloadResponseLabels,
  LedgerSendParam,
  EventType,
  NetworkModule,
  AccountFeature,
  MultisigTransactionState,
  Memo,
} from "../types"

export type GetAccountInfoResponse = ReturnType<typeof getAccountInfo>
export type CreateAccountResponse = { address: string }
type GetMultisigTokenReturnType = ReturnType<typeof getMultisigToken>
type SubmitMultisigTxnData = LedgerSendParam & {
  memo?: Memo
  threshold?: number
  expireInSecs?: number
  executeAutomatically?: boolean
}

type MultisigSetDefaults = {
  account: string
  threshold: number
  expireInSecs: number
  executeAutomatically: boolean
}

type AddFeaturesParams = {
  account: string
  roles?: Map<string, string[]>
  features: AccountFeature[]
}

type CreateParams = {
  name?: string
  roles?: Map<string, string[]>
  features: AccountFeature[]
}

export interface Account extends NetworkModule {
  info: (accountId: string) => Promise<GetAccountInfoResponse>
  create: (
    data: CreateParams,
    opts: { nonce?: ArrayBuffer },
  ) => Promise<CreateAccountResponse>
  setDescription: (account: string, description: string) => Promise<null>
  addRoles: (account: string, roles: Map<string, string[]>) => Promise<null>
  removeRoles: (account: string, roles: Map<string, string[]>) => Promise<null>
  addFeatures: (data: AddFeaturesParams) => Promise<unknown>
  submitMultisigTxn: (
    txnType: EventType,
    txnData: SubmitMultisigTxnData,
    opts: { nonce?: ArrayBuffer },
  ) => Promise<GetMultisigTokenReturnType>
  multisigInfo: (token: ArrayBuffer) => Promise<unknown>
  multisigApprove: (token: ArrayBuffer) => Promise<unknown>
  multisigRevoke: (token: ArrayBuffer) => Promise<unknown>
  multisigExecute: (token: ArrayBuffer) => Promise<unknown>
  multisigWithdraw: (token: ArrayBuffer) => Promise<unknown>
  multisigSetDefaults: (data: MultisigSetDefaults) => Promise<unknown>
}

export type MultisigInfoResponse = {
  info: MultisigTransactionInfo | undefined
}

export type AccountInfoData = {
  description: string
  roles: ReturnType<typeof getAccountRolesData>
  features: ReturnType<typeof getAccountFeaturesData>
}

export type MultisigTransactionInfo = {
  memo?: Memo
  transaction?: Omit<Event, "id" | "time">
  submitter: string
  approvers: Map<string, boolean>
  threshold: number
  executeAutomatically: boolean
  expireDate: number
  state: string
  cborData?: CborMap
}

export const Account: Account = {
  _namespace_: "account",

  async info(accountId: string): Promise<GetAccountInfoResponse> {
    const message = await this.call("account.info", new Map([[0, accountId]]))
    return getAccountInfo(message)
  },

  async submitMultisigTxn(
    txnType: EventType,
    txnData: SubmitMultisigTxnData,
    { nonce } = { nonce: makeRandomBytes(16) },
  ): Promise<GetMultisigTokenReturnType> {
    const m = new Map()
    m.set(0, txnData.from)
    txnData?.memo && m.set(1, txnData.memo)
    txnData?.threshold && m.set(3, txnData.threshold)
    txnData?.expireInSecs && m.set(4, txnData.expireInSecs)
    typeof txnData?.executeAutomatically === "boolean" &&
      m.set(5, txnData.executeAutomatically)
    m.set(2, makeSubmittedTxnData(txnType, txnData))
    const msg = await this.call("account.multisigSubmitTransaction", m, {
      nonce,
    })
    return getMultisigToken(msg)
  },

  async multisigInfo(token: ArrayBuffer): Promise<MultisigInfoResponse> {
    const res = await this.call("account.multisigInfo", new Map([[0, token]]))
    return await getMultisigInfo(res)
  },

  async multisigApprove(token: ArrayBuffer) {
    return await this.call("account.multisigApprove", new Map([[0, token]]))
  },

  async multisigRevoke(token: ArrayBuffer) {
    return await this.call("account.multisigRevoke", new Map([[0, token]]))
  },

  async multisigExecute(token: ArrayBuffer) {
    return await this.call("account.multisigExecute", new Map([[0, token]]))
  },

  async multisigWithdraw(token: ArrayBuffer) {
    return await this.call("account.multisigWithdraw", new Map([[0, token]]))
  },

  async multisigSetDefaults({
    account,
    threshold,
    expireInSecs,
    executeAutomatically,
  }: MultisigSetDefaults) {
    const m = new Map()
      .set(0, account)
      .set(1, threshold)
      .set(2, expireInSecs)
      .set(3, executeAutomatically)
    const res = await this.call("account.multisigSetDefaults", m)
    return res.getPayload()
  },

  async create(
    { name, roles, features }: CreateParams,
    { nonce } = { nonce: makeRandomBytes(16) },
  ) {
    if (!features) throw new Error("Minimum of one feature is required")
    const m = new Map().set(2, features)
    name && m.set(0, name)
    roles && m.set(1, roles)
    const message = (await this.call("account.create", m, { nonce })) as Message
    const decoded = message.getPayload()
    const address = decoded?.get(0)?.toString()
    return {
      address,
    }
  },

  async setDescription(account: string, description: string) {
    const res = await this.call(
      "account.setDescription",
      new Map().set(0, account).set(1, description),
    )
    return res.getPayload()
  },

  async addRoles(account: string, roles: Map<string, string[]>) {
    const res = await this.call(
      "account.addRoles",
      new Map().set(0, account).set(1, roles),
    )
    return res?.getPayload()
  },

  async removeRoles(account: string, roles: Map<string, string[]>) {
    const res = await this.call(
      "account.removeRoles",
      new Map().set(0, account).set(1, roles),
    )
    return res?.getPayload()
  },

  async addFeatures({ account, roles, features }: AddFeaturesParams) {
    if (!features) throw new Error("Minimum of one feature is required")
    const m = new Map().set(0, account).set(2, features)
    roles && m.set(1, roles)
    const res = await this.call("account.addFeatures", m)
    return res.getPayload()
  },
}

async function getMultisigInfo(msg: Message): Promise<MultisigInfoResponse> {
  const result: { info: MultisigTransactionInfo | undefined } = {
    info: undefined,
  }
  const content = msg.getPayload()
  if (content) {
    try {
      result.info = {
        memo: content.get(0),
        transaction: await makeTxnData(content.get(1) as Map<number, unknown>, {
          isTxnParamData: true,
        }),
        submitter: content.get(2)?.toString(),
        approvers: await (async function (): Promise<Map<string, boolean>> {
          const result: Map<string, boolean> = new Map()
          for (let approver of Array.from(content.get(3))) {
            const [address, hasApproved] = approver as [
              Address,
              Map<number, boolean>,
            ]
            result.set(address.toString(), hasApproved.get(0) as boolean)
          }
          return result
        })(),
        threshold: content.get(4),
        executeAutomatically: content.get(5),
        expireDate: content.get(6)?.value,
        cborData: content.get(7),
        state: MultisigTransactionState[content.get(8)],
      }
    } catch (e) {
      console.error("error in multisig txn data:", e)
    }
  }
  return result
}

function getMultisigToken(msg: Message) {
  const res: { token: ArrayBuffer | undefined } = {
    token: undefined,
  }
  const decoded = msg.getPayload()
  if (decoded) {
    res.token = decoded.get(0)
  }
  return res
}

function makeSubmittedTxnData(
  txnType: EventType,
  txnData: SubmitMultisigTxnData,
) {
  const accountMultisigTxn = new Map()
  let txnParam
  const txnTypeIndices = eventTypeNameToIndices[txnType]
  if (txnType === EventType.send) {
    txnParam = makeLedgerSendParam(txnData)
  }
  if (txnTypeIndices && txnParam) {
    accountMultisigTxn.set(0, txnTypeIndices)
    accountMultisigTxn.set(1, txnParam)
    return accountMultisigTxn
  }
  throw new Error(`transaction type not yet implemented: ${txnType}`)
}

function getAccountInfo(message: Message): {
  accountInfo: AccountInfoData | undefined
} {
  let result: { accountInfo: AccountInfoData | undefined } = {
    accountInfo: undefined,
  }
  const payload = message.getPayload()
  if (payload instanceof Map) {
    result.accountInfo = {
      ...makeAccountInfoData({
        description: payload.get(AccountInfoPayloadResponseLabels.name),
        roles: payload?.get?.(AccountInfoPayloadResponseLabels.roles),
        features: payload?.get?.(AccountInfoPayloadResponseLabels.features),
      }),
    }
  }
  return result
}
