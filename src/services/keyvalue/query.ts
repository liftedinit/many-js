import { Server } from "../server";
import { mapToObj, objToMap } from "../../shared/transform";

export interface KeyValueQuery {
  owner: string;
  enabled: boolean;
}

export interface KeyValueQueryArgs {
  key: string;
}

const queryMap = {
  0: "owner",
  1: "enabled",
};

const queryArgsMap = {
  0: "key",
};

export async function query(
  server: Server,
  queryArgs: KeyValueQueryArgs,
): Promise<KeyValueQuery> {
  const args = objToMap(queryArgs, queryArgsMap);
  const payload = await server.call("kvstore.query", args);
  return mapToObj<KeyValueQuery>(payload, queryMap);
}
