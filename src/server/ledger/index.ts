import { BaseServer } from "../../server"

import { balance, BalanceArgs } from "./balance"
import { info } from "./info"
import { send, SendArgs } from "./send"

export class Ledger extends BaseServer {
  info = () => info(this)
  balance = (args?: BalanceArgs) => balance(this, args!)
  sendTxn = (args: SendArgs) => send(this, args)
}
