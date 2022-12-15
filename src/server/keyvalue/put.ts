import { Server } from "../server"
import { objToMap } from "../../shared/helpers"

export interface PutArgs {
  key: string
  value: any
  owner?: string
}

const putArgsMap = {
  0: "key",
  1: "value",
  2: "owner",
}

export async function put(server: Server, putArgs: PutArgs): Promise<void> {
  const args = objToMap(putArgs, putArgsMap)
  await server.call("kvstore.put", args)
}
