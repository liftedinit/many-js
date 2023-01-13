import { Server } from "../server"
import { mapToObj, objToMap } from "../../shared/helpers"

export interface Query {
  owner: string
  enabled: boolean
}

export interface QueryArgs {
  key: string
}

const queryMap = {
  0: "owner",
  1: "enabled",
}

const queryArgsMap = {
  0: "key",
}

export async function query(
  server: Server,
  queryArgs: QueryArgs,
): Promise<Query> {
  const args = objToMap(queryArgs, queryArgsMap)
  const payload = await server.call("kvstore.query", args)
  return mapToObj<Query>(payload, queryMap)
}
