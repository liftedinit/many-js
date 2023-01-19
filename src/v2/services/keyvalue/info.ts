import { Server } from "../server"
import { mapToObj, Transform } from "../../shared/transform"
import { KeyValueInfo } from "./types"

const infoMap: Transform = {
  0: ["hash", { type: "bytes" }],
}

export async function info(server: Server): Promise<KeyValueInfo> {
  const payload = await server.call("kvstore.info")
  return mapToObj<KeyValueInfo>(payload, infoMap)
}
