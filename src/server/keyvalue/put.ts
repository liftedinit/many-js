import { Server } from "../server"
import { objToMap, Transform } from "../../shared/helpers"

export interface PutArgs {
  key: string
  value: any
  owner?: string
}

const putArgsMap: Transform = {
  0: ["key", { type: "bytes" }],
  1: ["value", { type: "bytes" }],
  2: "owner",
}

export async function put(server: Server, putArgs: PutArgs): Promise<void> {
  const args = objToMap(putArgs, putArgsMap)
  await server.call("kvstore.put", args)
}
