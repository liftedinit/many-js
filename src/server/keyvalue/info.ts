import { Server } from "../server"
import { mapToObj } from "../../shared/helpers"

export interface Info {
  hash: string
}

const infoMap = {
  0: "hash",
}

export async function info(server: Server): Promise<Info> {
  const payload = await server.call("kvstore.info")
  return mapToObj<Info>(payload, infoMap)
}
