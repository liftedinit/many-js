import { Server } from "../server"
import { mapToObj, objToMap, Transform } from "../../shared/transform"
import { KeyValueGet, KeyValueGetArgs } from "./types"

const getMap: Transform = {
  0: ["value", { fn: (value: Buffer) => value.toString() }],
}

const getArgsMap: Transform = { 0: ["key", { type: "bytes" }] }

export async function get(
  server: Server,
  getArgs: KeyValueGetArgs,
): Promise<KeyValueGet> {
  const args = objToMap(getArgs, getArgsMap)
  const payload = await server.call("kvstore.get", args)
  return mapToObj<KeyValueGet>(payload, getMap)
}
