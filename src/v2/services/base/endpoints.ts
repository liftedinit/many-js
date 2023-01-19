import { Server } from "../server"
import { BaseEndpoints } from "./types"

export async function endpoints(server: Server): Promise<BaseEndpoints> {
  const payload = await server.call("endpoints")
  return { endpoints: Array.isArray(payload) ? payload : [] }
}
