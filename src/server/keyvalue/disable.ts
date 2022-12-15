import { Server } from "../server"
import { objToMap } from "../../shared/helpers"

export interface DisableArgs {
  key: string
  owner?: string
}

const disableArgsMap = {
  0: "key",
  1: "owner",
}

export async function disable(
  server: Server,
  disableArgs: DisableArgs,
): Promise<void> {
  const args = objToMap(disableArgs, disableArgsMap)
  await server.call("kvstore.disable", args)
}
