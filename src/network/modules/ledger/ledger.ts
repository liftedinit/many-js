import cbor from "cbor"
import { Identity } from "../../../identity"
import { Message } from "../../../message"
import type { NetworkModule } from "../types"

export interface LedgerInfo {
  symbols: Map<ReturnType<Identity["toString"]>, string>
}

export enum OrderType {
  indeterminate = 0,
  ascending = 1,
  descending = 2,
}

type Bound<T> = [] | [0, T] | [1, T]

type Range<T> = Map<number, Bound<T>>

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

export enum TransactionType {
  send = "send",
  burn = "burn",
  mint = "mint",
}
export interface Transaction {
  id: string
  time: Date
  type: TransactionType
  amount: bigint
  symbolIdentity: string
  symbol?: string
  from?: string
  to?: string
  account?: string
}

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
  balance: (symbols?: string[]) => Promise<Balances>
  mint: () => Promise<unknown>
  burn: () => Promise<unknown>
  send: (to: Identity, amount: bigint, symbol: string) => Promise<unknown>
  transactions: () => Promise<{ count: bigint }>
  list: (opts?: ListArgs) => Promise<TransactionsData>
}

export const Ledger: Ledger = {
  _namespace_: "ledger",
  async info(): Promise<LedgerInfo> {
    const message = await this.call("ledger.info")
    return getLedgerInfo(message)
  },
  async balance(symbols?: string[]): Promise<Balances> {
    const res = await this.call(
      "ledger.balance",
      new Map([[1, symbols ? symbols : []]]),
    )
    return getBalance(res)
  },

  mint() {
    throw new Error("Not implemented")
  },

  async burn() {
    throw new Error("Not implemented")
  },

  async send(to: Identity, amount: bigint, symbol: string): Promise<unknown> {
    return await this.call(
      "ledger.send",
      new Map<number, any>([
        [1, to.toString()],
        [2, amount],
        [3, symbol],
      ]),
    )
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
    return getTxnList(res)
  },
}

export function getLedgerInfo(message: Message): LedgerInfo {
  const result: LedgerInfo = { symbols: new Map() }
  if (message.content.has(4)) {
    const decodedContent = cbor.decodeFirstSync(message.content.get(4))
    if (decodedContent.has(4)) {
      const symbols = decodedContent.get(4)

      for (const symbol of symbols) {
        const identity = new Identity(Buffer.from(symbol[0].value)).toString()
        const symbolName = symbol[1]
        result.symbols.set(identity, symbolName)
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
  if (message.content.has(4)) {
    const messageContent = cbor.decodeFirstSync(message.content.get(4))
    if (messageContent.has(0)) {
      const symbolsToBalancesMap = messageContent.get(0)
      if (!(symbolsToBalancesMap instanceof Map)) return result
      for (const balanceEntry of symbolsToBalancesMap) {
        const symbolIdentityStr = new Identity(balanceEntry[0].value).toString()
        const balance = balanceEntry[1]
        result.balances.set(symbolIdentityStr, balance)
      }
    }
  }
  return result
}

function getTransactionsCount(message: Message) {
  return {
    count: message?.content?.has(4)
      ? cbor.decodeFirstSync(message.content.get(4))?.get(0)
      : 0,
  }
}

function getTxnList(message: Message): TransactionsData {
  const result = {
    count: 0,
    transactions: [],
  }
  if (message.content.has(4)) {
    const decodedContent = cbor.decodeFirstSync(message.content.get(4))
    result.count = decodedContent.get(0)
    const transactions = decodedContent.get(1)
    result.transactions = transactions.map((t: Map<number, unknown>) => {
      let transactionData = t.get(2) as Array<unknown>
      const transactionType = transactionData[0]
      if (transactionType === 0) {
        return makeSendTransactionData(t)
      }
    })
  }
  return result
}

function makeSendTransactionData(t: Map<number, unknown>) {
  let transactionData = t.get(2) as Array<unknown>
  const id = t.get(0) as Uint8Array
  const time = t.get(1)
  const from = transactionData[1] as { value: Uint8Array }
  const to = transactionData[2] as { value: Uint8Array }
  const fromAddress = new Identity(from.value as Buffer).toString()
  const toAddress = new Identity(to.value as Buffer).toString()
  return {
    id,
    time,
    type: TransactionType.send,
    from: fromAddress,
    to: toAddress,
    symbolIdentity: transactionData[3],
    amount: BigInt(transactionData[4] as number),
  }
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