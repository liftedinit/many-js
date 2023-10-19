import { Server } from "../server";
import { mapToObj, Transform } from "../../shared/transform";
import { CborData, cborDataToString } from "../../message/encoding";

export interface KeyValueInfo {
  hash: string;
}

const infoMap: Transform = {
  0: ["hash", { fn: (hash: CborData) => cborDataToString(hash, "hex") }],
};

export async function info(server: Server): Promise<KeyValueInfo> {
  const payload = await server.call("kvstore.info");
  return mapToObj<KeyValueInfo>(payload, infoMap);
}
