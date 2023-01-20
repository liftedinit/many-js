import { BaseService } from "../base"

import { disable, KeyValueDisableArgs } from "./disable"
import { get, KeyValueGetArgs } from "./get"
import { info } from "./info"
import { put, KeyValuePutArgs } from "./put"
import { query, KeyValueQueryArgs } from "./query"

export class KeyValueService extends BaseService {
  info = () => info(this)
  get = (args: KeyValueGetArgs) => get(this, args)
  put = (args: KeyValuePutArgs) => put(this, args)
  query = (args: KeyValueQueryArgs) => query(this, args)
  disable = (args: KeyValueDisableArgs) => disable(this, args)
}
