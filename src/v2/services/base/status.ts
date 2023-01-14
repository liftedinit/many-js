import { Server } from "../server"
import { mapToObj } from "../../shared/transform"

export interface Status {
  protocolVersion: number
  serverName: string
  publicKey: unknown
  address: string
  attributes: string[]
  serverVersion: string
  timeDeltaInSecs: number
}

const statusMap = {
  0: "protocolVersion",
  1: "serverName",
  2: "publicKey",
  3: "address",
  4: "attributes",
  5: "serverVersion",
  6: "timeDeltaInSecs",
}

export async function status(server: Server): Promise<Status> {
  const payload = await server.call("status")
  return mapToObj<Status>(payload, statusMap)
}