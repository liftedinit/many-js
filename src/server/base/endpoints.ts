import { Server } from "../server"

export interface Endpoints {
  endpoints: string[]
}

export async function endpoints(server: Server): Promise<Endpoints> {
  const payload = await server.call("endpoints")
  return { endpoints: Array.isArray(payload) ? payload : [] }
}
