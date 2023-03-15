import { Server } from "../server";
import { objToMap } from "../../shared/transform";

export interface KeyValueDisableArgs {
  key: string;
  owner?: string;
}

const disableArgsMap = {
  0: "key",
  1: "owner",
};

export async function disable(
  server: Server,
  disableArgs: KeyValueDisableArgs,
): Promise<void> {
  const args = objToMap(disableArgs, disableArgsMap);
  await server.call("kvstore.disable", args);
}
