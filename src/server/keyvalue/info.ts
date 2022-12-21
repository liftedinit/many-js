import { Server } from "../server"
import { mapToObj, Transform } from "../../shared/helpers"

export interface Info {
  hash: string
}

const infoMap: Transform = {
  0: ["hash", { type: "bytes" }],
}

export async function info(server: Server): Promise<Info> {
  const payload = await server.call("kvstore.info")
  return mapToObj<Info>(payload, infoMap)
}
