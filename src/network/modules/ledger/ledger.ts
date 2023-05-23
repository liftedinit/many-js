import { Message } from "../../../message"
import { makeLedgerSendParam, makeRandomBytes } from "../../../utils"
import { LedgerSendParam, NetworkModule } from "../types"

export interface LedgerInfo {
  symbols: Map<string, string>
}

interface Ledger extends NetworkModule {
  _namespace_: string
  info: () => Promise<LedgerInfo>
  balance: (address?: string, symbols?: string[]) => Promise<Balances>
  send: (
    data: LedgerSendParam,
    opts: { nonce?: ArrayBuffer },
  ) => Promise<unknown>
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
  async send(
    param: LedgerSendParam,
    { nonce } = { nonce: makeRandomBytes(16) },
  ): Promise<unknown> {
    return await this.call("ledger.send", makeLedgerSendParam(param), { nonce })
  },
}

export function getLedgerInfo(message: Message): LedgerInfo {
  const result: LedgerInfo = { symbols: new Map() }
  const decodedContent = message.getPayload()
  if (decodedContent) {
    if (decodedContent.has(4)) {
      const symbols = decodedContent.get(4)

      for (const symbol of symbols) {
        const address = symbol[0].toString()
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
      const symbolAddress = balanceEntry[0].toString()
      const balance = balanceEntry[1]
      result.balances.set(symbolAddress, balance)
    }
  }
  return result
}
