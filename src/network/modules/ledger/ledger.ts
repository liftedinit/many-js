import { Address } from "../../../identity"
import { Message } from "../../../message"
import { CborMap } from "../../../message/cbor"
import { makeLedgerSendParam, makeTxnData } from "../../../utils"
import { LedgerSendParam, LedgerTransactionType, NetworkModule } from "../types"

export interface LedgerInfo {
  symbols: Map<ReturnType<Address["toString"]>, string>
}

export enum OrderType {
  indeterminate = 0,
  ascending = 1,
  descending = 2,
}

type Bound<T> = [] | [0, T] | [1, T]

type Range<T> = Map<0 | 1, Bound<T>>

interface RangeBound {
  boundType: BoundType
  value: unknown
}

interface TxnRangeBound extends Omit<RangeBound, "value"> {
  value: Uint8Array
}

interface ListArgs {
  count?: number
  filters?: ListFilterArgs
  order?: OrderType
}

interface BaseTransaction {
  id: ArrayBuffer
  time: Date
  type: LedgerTransactionType
}

export interface SendTransaction extends BaseTransaction {
  amount: bigint
  from: string
  to: string
  symbolAddress: string
}

export interface MultisigTransaction extends BaseTransaction {
  account: string
  execute_automatically: boolean
  memo: string
  submitter: string
  threshold: number
  timeout: Date
  token: ArrayBuffer
  transaction: Omit<Transaction, "id" | "time"> | undefined
  data?: CborMap
}

export type Transaction = SendTransaction | MultisigTransaction

interface TransactionsData {
  count: number
  transactions: Transaction[]
}

export enum BoundType {
  unbounded = "unbounded",
  inclusive = "inclusive",
  exclusive = "exclusive",
}

export interface ListFilterArgs {
  accounts?: string | string[]
  symbols?: string | string[]
  txnIdRange?: [TxnRangeBound?, TxnRangeBound?]
}

export enum RangeType {
  lower = "lower",
  upper = "upper",
}
interface Ledger extends NetworkModule {
  _namespace_: string
  info: () => Promise<LedgerInfo>
  balance: (address?: string, symbols?: string[]) => Promise<Balances>
  mint: () => Promise<unknown>
  burn: () => Promise<unknown>
  send: (data: LedgerSendParam) => Promise<unknown>
  transactions: () => Promise<{ count: bigint }>
  list: (opts?: ListArgs) => Promise<TransactionsData>
}

export const Ledger: Ledger = {
  _namespace_: "ledger",
  async info(): Promise<LedgerInfo> {
    const message = await this.call("ledger.info")
    return getLedgerInfo(message)
  },
  async balance(address?: string, symbols?: string[]): Promise<Balances> {
    const m = new Map<number, unknown>([[1, symbols ?? []]])
    address && m.set(0, address)
    const res = await this.call("ledger.balance", m)
    return getBalance(res)
  },

  mint() {
    throw new Error("Not implemented")
  },

  async burn() {
    throw new Error("Not implemented")
  },

  async send(param: LedgerSendParam): Promise<unknown> {
    return await this.call("ledger.send", makeLedgerSendParam(param))
  },

  // 4 - Ledger Transactions
  async transactions() {
    const res = await this.call("ledger.transactions")
    return getTransactionsCount(res)
  },

  async list({
    filters = {},
    count = 10,
    order = OrderType.descending,
  }: ListArgs = {}): Promise<TransactionsData> {
    const res = await this.call(
      "ledger.list",
      new Map<number, any>([
        [0, count],
        [1, order],
        [2, makeListFilters(filters)],
      ]),
    )
    return await getTxnList(res)
  },
}

export function getLedgerInfo(message: Message): LedgerInfo {
  const result: LedgerInfo = { symbols: new Map() }
  const decodedContent = message.getPayload()
  if (decodedContent) {
    if (decodedContent.has(4)) {
      const symbols = decodedContent.get(4)

      for (const symbol of symbols) {
        const address = new Address(Buffer.from(symbol[0].value)).toString()
        const symbolName = symbol[1]
        result.symbols.set(address, symbolName)
      }
    }
  }
  return result
}

export interface Balances {
  balances: Map<string, bigint>
}

export function getBalance(message: Message): Balances {
  const result = { balances: new Map() }
  const messageContent = message.getPayload()
  if (messageContent && messageContent.has(0)) {
    const symbolsToBalancesMap = messageContent.get(0)
    if (!(symbolsToBalancesMap instanceof Map)) return result
    for (const balanceEntry of symbolsToBalancesMap) {
      const symbolAddress = new Address(balanceEntry[0].value).toString()
      const balance = balanceEntry[1]
      result.balances.set(symbolAddress, balance)
    }
  }
  return result
}

function getTransactionsCount(message: Message) {
  return {
    count: message?.getContent().has(4) ? message?.getPayload()?.get(0) : 0,
  }
}

async function getTxnList(message: Message): Promise<TransactionsData> {
  const result: TransactionsData = {
    count: 0,
    transactions: [],
  }
  const decodedContent = message.getPayload()
  if (decodedContent) {
    result.count = decodedContent.get(0)
    const transactions = decodedContent.get(1)
    result.transactions = (
      await Promise.all(
        transactions.map(async (t: Map<number, unknown>) => {
          try {
            return {
              id: t.get(0),
              time: t.get(1),
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
    const rangeMap = new Map()
    const [lower, upper] = txnIdRange
    if (lower) {
      setRangeBound<Uint8Array>({
        rangeMap,
        rangeType: RangeType.lower,
        ...lower,
      })
    }
    if (upper) {
      setRangeBound<Uint8Array>({
        rangeMap,
        rangeType: RangeType.upper,
        ...upper,
      })
    }
    result.set(3, rangeMap)
  }

  return result
}

export function setRangeBound<T>({
  rangeMap,
  rangeType,
  boundType,
  value,
}: {
  rangeMap: Range<T>
  rangeType: RangeType
  boundType: BoundType
  value: unknown
}) {
  const rangeVal = rangeType === RangeType.lower ? 0 : 1
  const boundVal = (
    boundType !== BoundType.unbounded
      ? [boundType === BoundType.inclusive ? 0 : 1, value]
      : []
  ) as Bound<T>
  rangeMap.set(rangeVal, boundVal)
}
