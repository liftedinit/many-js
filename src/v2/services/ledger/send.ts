import { Server } from "../server"
import { objToMap } from "../../shared/transform"
import { SendArgs } from "./types"

const sendArgsMap = { 0: "from", 1: "to", 2: "amount", 3: "token" }

export async function send(server: Server, sendArgs: SendArgs): Promise<void> {
  const args = objToMap(sendArgs, sendArgsMap)
  await server.call("ledger.send", args)
}
