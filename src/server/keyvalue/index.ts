import { BaseServer } from "../../server"

import { disable, DisableArgs } from "./disable"
import { get, GetArgs } from "./get"
import { info } from "./info"
import { put, PutArgs } from "./put"
import { query, QueryArgs } from "./query"

export class KeyValue extends BaseServer {
  info = () => info(this)
  get = (args: GetArgs) => get(this, args)
  put = (args: PutArgs) => put(this, args)
  query = (args: QueryArgs) => query(this, args)
  disable = (args: DisableArgs) => disable(this, args)
}
