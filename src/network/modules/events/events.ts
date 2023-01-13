import { Message } from "../../../message"
import { CborMap } from "../../../message/cbor"
import {
  getAccountFeaturesData,
  getAccountRolesData,
  getEventTypeNameFromIndices,
  makeRange,
  makeTxnData,
} from "../../../utils"
import {
  EventType,
  EventTypeIndices,
  ListOrderType,
  NetworkModule,
  RangeBounds,
} from "../types"

interface ListArgs {
  count?: number
  filters?: ListFilterArgs
  order?: ListOrderType
}

interface BaseEvent {
  id: ArrayBuffer
  time: number
  type: EventType
}

export interface SendEvent extends BaseEvent {
  amount: bigint
  from: string
  to: string
  symbolAddress: string
}

export interface CreateAccountEvent extends BaseEvent {
  account: string
  description: string
  roles: ReturnType<typeof getAccountRolesData>
  features: ReturnType<typeof getAccountFeaturesData>
}

export interface AddFeaturesEvent extends BaseEvent {
  account: string
  roles?: ReturnType<typeof getAccountRolesData>
  features?: ReturnType<typeof getAccountFeaturesData>
}

export interface SetDescriptionEvent extends BaseEvent {
  account: string
  description: string
}

export interface AddRolesEvent extends BaseEvent {
  account: string
  roles: Map<string, string[]>
}

export interface RemoveRolesEvent extends BaseEvent {
  account: string
  roles: Map<string, string[]>
}

export interface MultisigEvent extends BaseEvent {
  account: string
  token?: ArrayBuffer
}

export interface MultisigApproveEvent extends MultisigEvent {
  approver: string
}
export interface MultisigRevokeEvent extends MultisigEvent {
  revoker: string
}

export interface MultisigExecuteEvent extends MultisigEvent {
  executor: string
}

export interface MultisigWithdrawEvent extends MultisigEvent {
  withdrawer: string
}

export interface MultisigSetDefaultsEvent extends MultisigEvent {
  submitter: string
  threshold: number
  expireInSecs: number
  executeAutomatically: boolean
}

export interface MultisigSubmitEvent extends MultisigEvent {
  account: string
  executeAutomatically: boolean
  memo: string
  submitter: string
  threshold: number
  expireDate: number
  token: ArrayBuffer
  transaction: Omit<Event, "id" | "time"> | undefined
  data?: CborMap
}

export type Event =
  | SendEvent
  | CreateAccountEvent
  | MultisigSubmitEvent
  | MultisigApproveEvent
  | MultisigRevokeEvent
  | MultisigExecuteEvent
  | MultisigWithdrawEvent
  | MultisigSetDefaultsEvent
  | AddFeaturesEvent
  | SetDescriptionEvent
  | AddRolesEvent
  | RemoveRolesEvent

export interface EventsListResponse {
  count: number
  events: Event[]
}

export interface ListFilterArgs {
  accounts?: string | string[]
  symbols?: string | string[]
  txnIdRange?: RangeBounds<Uint8Array>
}

export enum RangeType {
  lower = "lower",
  upper = "upper",
}

export type EventsInfoResponse = {
  count: number
  events: EventType[]
}

interface Events extends NetworkModule {
  _namespace_: string
  info: () => Promise<EventsInfoResponse>
  list: (opts?: ListArgs) => Promise<EventsListResponse>
}

export const Events: Events = {
  _namespace_: "events",

  async info() {
    const res = await this.call("events.info")
    return await getEventsInfo(res)
  },

  async list({
    filters = {},
    count = 10,
    order = ListOrderType.descending,
  }: ListArgs = {}): Promise<EventsListResponse> {
    const res = await this.call(
      "events.list",
      new Map<number, any>([
        [0, count],
        [1, order],
        [2, makeListFilters(filters)],
      ]),
    )
    return await getEventsList(res)
  },
}

async function getEventsInfo(message: Message) {
  const payload = message.getPayload()
  return {
    count: message?.getContent().has(4) ? message?.getPayload()?.get(0) : 0,
    events: (
      await Promise.all(
        payload.get(1).map(async (eventType: EventTypeIndices) => {
          return await getEventTypeNameFromIndices(eventType)
        }),
      )
    ).filter(Boolean),
  }
}

async function getEventsList(message: Message): Promise<EventsListResponse> {
  const result: EventsListResponse = {
    count: 0,
    events: [],
  }
  const decodedContent = message.getPayload()
  if (decodedContent) {
    result.count = decodedContent.get(0)
    const events = decodedContent.get(1)
    result.events = (
      await Promise.all(
        events.map(async (t: CborMap) => {
          try {
            return {
              id: t.get(0),
              time: t.get(1)?.value,
              ...(await makeTxnData(t.get(2) as Map<number, unknown>)),
            }
          } catch (e) {
            console.error("error parsing txn:", e)
          }
        }),
      )
    ).filter(Boolean)
  }
  return result
}

export function makeListFilters(filters: ListFilterArgs): Map<number, unknown> {
  const result = new Map()
  const { accounts, symbols, txnIdRange } = filters

  if (accounts) {
    if (typeof accounts !== "string" && !Array.isArray(accounts))
      throw "type of filter.accounts must be a string or string[]"
    result.set(0, accounts)
  }

  if (symbols) {
    if (typeof symbols !== "string" && !Array.isArray(symbols))
      throw "type of filter.symbols must be a string or string[]"
    result.set(2, symbols)
  }

  if (txnIdRange) {
    result.set(3, makeRange(txnIdRange))
  }

  return result
}
