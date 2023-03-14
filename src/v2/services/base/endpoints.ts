import { Server } from "../server"

export interface BaseEndpoints {
  endpoints: string[]
}

export async function endpoints(server: Server): Promise<BaseEndpoints> {
  const payload = await server.call("endpoints")
  return { endpoints: Array.isArray(payload) ? payload : [] }
}
