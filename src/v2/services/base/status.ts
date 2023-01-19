import { mapToObj } from "../../shared/transform"
import { Server } from "../server"
import { BaseStatus } from "./types"

const statusMap = {
  0: "protocolVersion",
  1: "serverName",
  2: "publicKey",
  3: "address",
  4: "attributes",
  5: "serverVersion",
  6: "timeDeltaInSecs",
}

export async function status(server: Server): Promise<BaseStatus> {
  const payload = await server.call("status")
  console.log(payload)
  const obj = mapToObj<BaseStatus>(payload, statusMap)
  console.log(obj)
  return mapToObj<BaseStatus>(payload, statusMap)
}
