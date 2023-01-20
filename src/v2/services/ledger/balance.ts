import { Server } from "../server"
import { mapToObj, objToMap, Transform } from "../../shared/transform"

export interface LedgerBalance {
  balances: Map<string, number>
}

export interface LedgerBalanceArgs {
  address?: string
  tokens?: string[]
}

const balanceMap: Transform = {
  0: ["balances", { type: "map" }],
}

const balanceArgsMap = {
  0: "address",
  1: "tokens",
}

export async function balance(
  server: Server,
  balanceArgs: LedgerBalanceArgs,
): Promise<LedgerBalance> {
  const args = objToMap(balanceArgs, balanceArgsMap)
  const payload = await server.call("ledger.balance", args)
  return mapToObj<LedgerBalance>(payload, balanceMap)
}
