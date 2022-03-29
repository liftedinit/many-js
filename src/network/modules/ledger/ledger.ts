import cbor from "cbor"
import { Identity } from "../../../identity"
import { Message } from "../../../message"
import type { NetworkModule } from "../types"

export interface LedgerInfo {
  symbols: Map<ReturnType<Identity["toString"]>, string>
}

interface Ledger extends NetworkModule {
  _namespace_: string
  info: () => Promise<LedgerInfo>
  balance: () => Promise<unknown>
  mint: () => Promise<unknown>
  burn: () => Promise<unknown>
  send: (to: Identity, amount: bigint, symbol: string) => Promise<unknown>
  transactions: () => Promise<unknown>
  list: () => Promise<unknown>
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
    // @ts-ignore
    return await this.call(
      "account.send",
      new Map<number, any>([
        [1, to.toString()],
        [2, amount],
        [3, symbol],
      ]),
    )
  },

  // 4 - Ledger Transactions
  transactions() {
    throw new Error("not implemented")
  },

  list() {
    throw new Error("not implemented")
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
function getBalance(message: Message): Balances {
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
