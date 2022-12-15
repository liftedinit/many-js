import { Server } from "../server"
import { mapToObj, Transform } from "../../shared/helpers"

export interface TokenInfo {
  name: string
  symbol: string
  precision: number
}

export interface Info {
  hash: string
  tokens: Map<string, TokenInfo>
}

const infoMap: Transform = {
  1: "hash",
  5: ["tokens", { 0: "name", 1: "symbol", 2: "precision" }, { type: "map" }],
}

export async function info(server: Server): Promise<Info> {
  const payload = await server.call("ledger.info")
  return mapToObj<Info>(payload, infoMap)
}
