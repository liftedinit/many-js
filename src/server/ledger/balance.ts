import { Server } from "../server"
import { mapToObj, objToMap, Transform } from "../../shared/helpers"

export interface Balance {
  balances: Map<string, number>
}

export interface BalanceArgs {
  address?: string
  tokens?: string[]
}

const balanceMap: Transform = {
  0: ["balances", undefined, { type: "map" }],
}

const balanceArgsMap = {
  0: "address",
  1: "tokens",
}

export async function balance(
  server: Server,
  balanceArgs: BalanceArgs,
): Promise<Balance> {
  const args = objToMap(balanceArgs, balanceArgsMap)
  const payload = await server.call("ledger.balance", args)
  return mapToObj<Balance>(payload, balanceMap)
}
