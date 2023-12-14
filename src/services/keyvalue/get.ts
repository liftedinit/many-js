import { Server } from "../server";
import { mapToObj, objToMap, Transform } from "../../shared/transform";
import { bufferToStr, strToBuffer } from "../../shared/utils";

export interface KeyValueGet {
  value?: string;
}

export interface KeyValueGetArgs {
  key: string;
}

const getMap: Transform = {
  0: ["value", { fn: bufferToStr }],
};

const getArgsMap: Transform = {
  0: ["key", { fn: strToBuffer }],
};

export async function get(
  server: Server,
  getArgs: KeyValueGetArgs,
): Promise<KeyValueGet> {
  const args = objToMap(getArgs, getArgsMap);
  const payload = await server.call("kvstore.get", args);
  return mapToObj<KeyValueGet>(payload, getMap);
}
