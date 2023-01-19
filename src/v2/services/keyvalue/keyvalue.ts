import { BaseService } from "../base"

import { disable } from "./disable"
import { get } from "./get"
import { info } from "./info"
import { put } from "./put"
import { query } from "./query"
import {
  KeyValueDisableArgs,
  KeyValueGetArgs,
  KeyValuePutArgs,
  KeyValueQueryArgs,
} from "./types"

export class KeyValueService extends BaseService {
  info = () => info(this)
  get = (args: KeyValueGetArgs) => get(this, args)
  put = (args: KeyValuePutArgs) => put(this, args)
  query = (args: KeyValueQueryArgs) => query(this, args)
  disable = (args: KeyValueDisableArgs) => disable(this, args)
}
