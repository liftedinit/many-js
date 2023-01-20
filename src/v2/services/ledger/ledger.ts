import { BaseService } from "../base"

import { balance, LedgerBalanceArgs } from "./balance"
import { info } from "./info"
import { send, LedgerSendArgs } from "./send"

export class LedgerService extends BaseService {
  info = () => info(this)
  balance = (args?: LedgerBalanceArgs) => balance(this, args!)
  sendTxn = (args: LedgerSendArgs) => send(this, args)
}
