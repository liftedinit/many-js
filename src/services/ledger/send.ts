import { Server } from "../server";
import { objToMap } from "../../shared/transform";

export interface LedgerSendArgs {
  from?: string;
  to: string;
  amount: number;
  token: string;
}

const sendArgsMap = { 0: "from", 1: "to", 2: "amount", 3: "token" };

export async function send(
  server: Server,
  sendArgs: LedgerSendArgs,
): Promise<void> {
  const args = objToMap(sendArgs, sendArgsMap);
  await server.call("ledger.send", args);
}
