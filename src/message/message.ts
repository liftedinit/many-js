import cbor from "cbor"
import { AnonymousIdentity, Identity } from "../identity"
import { CoseSign1 } from "./encoding"

type CborMap = Map<number | string, any>

export class Message {
  constructor(public content: CborMap) {}

  async toCoseSign1(
    identity: Identity = new AnonymousIdentity(),
  ): Promise<CoseSign1> {
    const protectedHeader = CoseSign1.getProtectedHeader(identity)
    const cborProtectedHeader = cbor.encodeCanonical(protectedHeader)
    const payload = this.content
    const cborContent = cbor.encode(new cbor.Tagged(10001, payload))
    const toBeSigned = cbor.encodeCanonical([
      "Signature1",
      cborProtectedHeader,
      Buffer.alloc(0),
      cborContent,
    ])
    // @TODO: Only sign unprotected header if ID doesn't support ed25519
    const unprotectedHeader = await identity.getUnprotectedHeader(
      cborContent,
      cborProtectedHeader,
    )
    // @TODO: Why do we sign both toBeSigned and unprotectedHeader?
    const signature = await identity.sign(toBeSigned, unprotectedHeader)
    return new CoseSign1(protectedHeader, unprotectedHeader, payload, signature)
  }

  async toBuffer(identity?: Identity) {
    return (await this.toCoseSign1(identity)).toBuffer()
  }

  static fromCoseSign1(cose: CoseSign1): Message {
    return new Message(cose.payload)
  }

  static fromBuffer(data: Buffer): Message {
    return Message.fromCoseSign1(CoseSign1.fromBuffer(data))
  }
}
