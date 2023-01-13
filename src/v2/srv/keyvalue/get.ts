import { Server } from "../server"
import { mapToObj, objToMap, Transform } from "../../shared/helpers"

export interface Get {
  value?: string
}

export interface GetArgs {
  key: string
}

const getMap: Transform = {
  0: ["value", { fn: (value: Buffer) => value.toString() }],
}

const getArgsMap: Transform = { 0: ["key", { type: "bytes" }] }

export async function get(server: Server, getArgs: GetArgs): Promise<Get> {
  const args = objToMap(getArgs, getArgsMap)
  const payload = await server.call("kvstore.get", args)
  return mapToObj<Get>(payload, getMap)
}
