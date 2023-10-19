import { Server } from "../server";
import { mapToObj, objToMap, Transform } from "../../shared/transform";
import {
  CborData,
  cborDataFromString,
  cborDataToString,
} from "../../message/encoding";

export interface KeyValueGet {
  value?: string;
}

export interface KeyValueGetArgs {
  key: string;
}

const getMap: Transform = {
  0: ["value", { fn: (value: CborData) => cborDataToString(value) }],
};

const getArgsMap: Transform = {
  0: ["key", { fn: (key: string) => cborDataFromString(key) }],
};

export async function get(
  server: Server,
  getArgs: KeyValueGetArgs,
): Promise<KeyValueGet> {
  const args = objToMap(getArgs, getArgsMap);
  const payload = await server.call("kvstore.get", args);
  return mapToObj<KeyValueGet>(payload, getMap);
}
