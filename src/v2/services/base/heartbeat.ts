import { Server } from "../server"

export async function heartbeat(server: Server): Promise<{}> {
  return await server.call("heartbeat")
}
