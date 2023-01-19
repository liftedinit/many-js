import { Server } from "../server"
import { mapToObj, objToMap } from "../../shared/transform"
import { KeyValueQuery, KeyValueQueryArgs } from "./types"

const queryMap = {
  0: "owner",
  1: "enabled",
}

const queryArgsMap = {
  0: "key",
}

export async function query(
  server: Server,
  queryArgs: KeyValueQueryArgs,
): Promise<KeyValueQuery> {
  const args = objToMap(queryArgs, queryArgsMap)
  const payload = await server.call("kvstore.query", args)
  return mapToObj<KeyValueQuery>(payload, queryMap)
}
