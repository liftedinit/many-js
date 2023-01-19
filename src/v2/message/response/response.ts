import cbor from "cbor"
import { mapToObj, Transform } from "../../shared/transform"
import { Result, Ok, Err } from "../../shared/result"
import { CborMap, CoseSign1 } from "../encoding"
import { ManyError } from "../error"
import { Message } from "../message"

type AsyncAttr = [1, Buffer]

interface ResponseObj {
  version?: number
  from: string
  to?: string
  result: Result<any, ManyError>
  timestamp?: number
  id?: number
  nonce?: string
  attrs?: unknown[]
}

const responseMap: Transform = {
  0: "version",
  1: ["from", { fn: (value: Buffer) => value.toString() }],
  2: ["to", { fn: (value?: Buffer) => value?.toString() }],
  4: [
    "result",
    {
      fn: (value: any) =>
        typeof value === "object" && !Buffer.isBuffer(value)
          ? Err(new ManyError(Object.fromEntries(value)))
          : Ok(cbor.decode(value as Buffer, decoders)),
    },
  ],
  5: ["timestamp", { fn: (value: number) => new cbor.Tagged(1, value) }],
  6: "id",
  7: ["nonce", { fn: (value: string) => cbor.encode(value) }],
  8: "attrs",
}

const decoders = {
  tags: {
    10000: (value: Uint8Array) => Buffer.from(value),
    1: (value: number) => new cbor.Tagged(1, value),
  },
}

export class Response extends Message {
  constructor(public content: CborMap) {
    super(content)
  }

  get token(): Buffer | undefined {
    const { attrs } = this.toJSON()
    if (!attrs) {
      return
    }
    return (
      attrs?.find(attr => Array.isArray(attr) && attr[0] === 1) as AsyncAttr
    )[1]
  }

  get result(): Result<any, ManyError> {
    const { result } = this.toJSON()
    return result
  }

  toJSON(): ResponseObj {
    const obj: ResponseObj = mapToObj(this.content, responseMap)
    const { result } = obj
    if (result.ok) {
      result.value = Object.fromEntries(result.value)
    }
    return { ...obj, result }
  }

  static fromCoseSign1(cose: CoseSign1): Response {
    return new Response(cose.payload)
  }

  static fromBuffer(data: Buffer): Response {
    return Response.fromCoseSign1(CoseSign1.fromBuffer(data))
  }
}
