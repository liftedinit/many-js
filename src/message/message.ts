import cbor from "cbor"
import { Address, AnonymousIdentity, Identity } from "../identity"
import { tag, decoders } from "./encoding"
import { ManyError, SerializedManyError } from "./error"
import { Attributes, AsyncAttribute } from "./attributes"
import { CoseSign1 } from "./encoding"

interface MessageContent {
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

type CborMap = Map<number | string, any>

export class Message {
  constructor(public content: CborMap) {}

  getAsyncToken(): ArrayBuffer | undefined {
    const attributes = Attributes.getFromMessage(this)
    return attributes
      ? AsyncAttribute.getFromAttributes(attributes)?.getToken()
      : undefined
  }

  getPayload(): CborMap {
    return cbor.decode(this.content.get(4), decoders)
  }

  // @TODO: Make synchronous
  async toCoseSign1(
    identity: Identity = new AnonymousIdentity(),
  ): Promise<CoseSign1> {
    const protectedHeader = await CoseSign1.getProtectedHeader(identity)
    const cborProtectedHeader = cbor.encodeCanonical(protectedHeader)
    const payload = this.content
    const cborContent = cbor.encode(new cbor.Tagged(10001, payload))
    const toBeSigned = cbor.encodeCanonical([
      "Signature1",
      cborProtectedHeader,
      Buffer.alloc(0),
      cborContent,
    ])
    const unprotectedHeader = await identity.getUnprotectedHeader(
      cborContent,
      cborProtectedHeader,
    )
    const signature = await identity.sign(toBeSigned, unprotectedHeader)
    return new CoseSign1(protectedHeader, unprotectedHeader, payload, signature)
  }

  async toBuffer(identity?: Identity) {
    return (await this.toCoseSign1(identity)).toBuffer()
  }

  static fromObject(obj: MessageContent): Message {
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
      tag(1, obj.timestamp ? obj.timestamp : Math.floor(Date.now() / 1000)),
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

  static fromCoseSign1(message: CoseSign1): Message {
    const content = message.payload
    const data = content.get(4)
    // @TODO: Return the error, don't throw it
    if (typeof data == "object" && !Buffer.isBuffer(data)) {
      throw new ManyError(
        Object.fromEntries(data.entries()) as SerializedManyError,
      )
    }
    return new Message(content)
  }

  static fromBuffer(data: Buffer): Message {
    return Message.fromCoseSign1(CoseSign1.fromBuffer(data))
  }
}
