import cbor from "cbor"

import { Address } from "../../identity"
import { objToMap, Transform } from "../../shared/helpers"
import { Message } from "../message"

export interface RequestObj {
  version?: number
  from?: Address
  to?: Address
  method: string
  data?: any
  timestamp?: number
  id?: number
  nonce?: string
  attrs?: string[]
}

const requestMap: Transform = {
  0: "version",
  1: ["from", { fn: (value: Address) => value.toString() }],
}

export class Request extends Message {
  static fromObject(obj: RequestObj): Message {
    const defaults = {
      version: 1,
      timestamp: Math.floor(Date.now() / 1000),
    }

    // const contentArgs = objToMap(obj, requestMap)

    if (!obj.method) {
      throw new Error("Property 'method' is required.")
    }
    const content = new Map()
    content.set(0, obj.version ? obj.version : 1)
    if (obj.from) {
      content.set(1, obj.from.toString())
    }
    if (obj.to) {
      content.set(2, obj.to.toString())
    }
    content.set(3, obj.method)
    if (obj.data) {
      content.set(4, cbor.encode(obj.data))
    }
    content.set(
      5,
      new cbor.Tagged(
        1,
        obj.timestamp ? obj.timestamp : Math.floor(Date.now() / 1000),
      ),
    )
    if (obj.id) {
      content.set(6, obj.id)
    }
    if (obj.nonce) {
      content.set(7, cbor.encode(obj.nonce))
    }
    if (obj.attrs) {
      content.set(8, obj.attrs)
    }
    return new Message(content)
  }
}
