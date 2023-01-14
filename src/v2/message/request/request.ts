import cbor from "cbor"
import { objToMap, Transform } from "../../shared/transform"
import { Message } from "../message"
import { CoseSign1 } from "../encoding"

export interface RequestArgs {
  version?: number
  from?: string
  to?: string
  method: string
  data?: any
  timestamp?: number
  id?: number
  nonce?: string
  attrs?: string[]
}

const requestMap: Transform = {
  0: "version",
  1: "from",
  2: "to",
  3: "method",
  4: [
    "data",
    { fn: (value?: any) => (value ? cbor.encode(value) : undefined) },
  ],
  5: ["timestamp", { fn: (value: number) => new cbor.Tagged(1, value) }],
  6: "id",
  7: ["nonce", { fn: (value: string) => cbor.encode(value) }],
  8: "attrs",
}

export class Request extends Message {
  static fromObject(obj: RequestArgs): Request {
    if (!obj.method) {
      throw new Error("Property 'method' is required.")
    }
    const defaults = {
      version: 1,
      timestamp: Math.floor(Date.now() / 1000),
    }
    return new Request(objToMap({ ...defaults, ...obj }, requestMap))
  }

  static fromBuffer(data: Buffer): Request {
    return new Request(CoseSign1.fromBuffer(data).payload)
  }
}