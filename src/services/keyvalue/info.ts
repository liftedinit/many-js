import { Server } from "../server";
import { mapToObj, Transform } from "../../shared/transform";
import { bytesToHex } from "../../shared/utils";

export interface KeyValueInfo {
  hash: string;
}

const infoMap: Transform = {
  0: ["hash", { fn: bytesToHex }],
};

export async function info(server: Server): Promise<KeyValueInfo> {
  const payload = await server.call("kvstore.info");
  return mapToObj<KeyValueInfo>(payload, infoMap);
}
