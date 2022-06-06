import { LedgerSendParam } from "../../network"

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
