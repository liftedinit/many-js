import cbor from "cbor"
import { Attributes, AsyncAttribute } from "../attributes"
import { Address } from "../../identity"
// import { objToMap, Transform } from "../../shared/helpers"
import { CoseSign1 } from "../encoding"
import { ManyError, SerializedManyError } from "../error"
import { Message } from "../message"

type CborMap = Map<number | string, any>

// interface ResponseObj {
//   version?: number
//   from: Address
//   to?: Address
//   result: any // @TODO: Should be either an error or "data"
//   timestamp?: number
//   id?: number
//   nonce?: string
//   attrs?: string[]
// }

// const responseMap: Transform = {
//   0: "version",
//   1: ["from", { fn: (value: Address) => value.toString() }],
//   2: ["to", { fn: (value?: Address) => value?.toString() }],
//   4: [
//     "data",
//     { fn: (value?: any) => (value ? cbor.encode(value) : undefined) },
//   ],
//   5: ["timestamp", { fn: (value: number) => new cbor.Tagged(1, value) }],
//   6: "id",
//   7: ["nonce", { fn: (value: string) => cbor.encode(value) }],
//   8: "attrs",
// }

const decoders = {
  tags: {
    10000: (value: Uint8Array) => new Address(Buffer.from(value)),
    1: (value: number) => new cbor.Tagged(1, value),
  },
}

export class Response extends Message {
  getAsyncToken(): ArrayBuffer | undefined {
    const attributes = Attributes.getFromMessage(this)
    return attributes
      ? AsyncAttribute.getFromAttributes(attributes)?.getToken()
      : undefined
  }

  getPayload(): CborMap {
    return cbor.decode(this.content.get(4), decoders)
  }

  static fromCoseSign1(cose: CoseSign1): Response {
    const { payload } = cose

    // @TODO: Return either an Error, decoded data, or a Pending result

    const result = payload.get(4)
    const isError = typeof result === "object" && !Buffer.isBuffer(result)
    // const isPending = payload.has(8)

    if (isError) {
      throw new ManyError(
        Object.fromEntries(result.entries()) as SerializedManyError,
      )
    }
    return new Response(payload)
  }

  static fromBuffer(data: Buffer): Response {
    return Response.fromCoseSign1(CoseSign1.fromBuffer(data))
  }
}
