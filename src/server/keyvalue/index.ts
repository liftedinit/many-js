import { BaseServer } from "../../server"

import { disable } from "./disable"
import { get } from "./get"
import { info } from "./info"
import { put } from "./put"
import { query } from "./query"

export class KeyValue extends BaseServer {
  info = () => info(this)
  get = (key: string) => get(this, { key })
  put = (key: string, value: any, owner?: string) =>
    put(this, { key, value, owner })
  query = (key: string) => query(this, { key })
  disable = (key: string, owner?: string) => disable(this, { key, owner })
}
