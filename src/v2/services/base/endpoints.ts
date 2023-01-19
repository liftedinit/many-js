import { Server } from "../server"
import { Endpoints } from "./types"

export async function endpoints(server: Server): Promise<Endpoints> {
  const payload = await server.call("endpoints")
  return { endpoints: Array.isArray(payload) ? payload : [] }
}
