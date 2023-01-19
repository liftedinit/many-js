import { BaseService } from "../base"

import { balance } from "./balance"
import { info } from "./info"
import { send } from "./send"
import { BalanceArgs, SendArgs } from "./types"

export class LedgerService extends BaseService {
  info = () => info(this)
  balance = (args?: BalanceArgs) => balance(this, args!)
  sendTxn = (args: SendArgs) => send(this, args)
}
