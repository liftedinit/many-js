import { Server } from "../server";
import { objToMap, Transform } from "../../shared/transform";

export interface KeyValuePutArgs {
  key: string;
  value: any;
  owner?: string;
}

const putArgsMap: Transform = {
  0: ["key", { fn: (key: string) => Buffer.from(key) }],
  1: ["value", { fn: (value: string) => Buffer.from(value) }],
  2: "owner",
};

export async function put(
  server: Server,
  putArgs: KeyValuePutArgs,
): Promise<void> {
  const args = objToMap(putArgs, putArgsMap);
  await server.call("kvstore.put", args);
}
