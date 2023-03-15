import cbor from "cbor"
import { Identifier } from "../../id"
import { tag, CborMap } from "./cbor"

export const decoders = {
  tags: {
    10000: (value: Uint8Array) => new Identifier(value),
    1: (value: number) => tag(1, value),
  },
}

export class CoseSign1 {
  constructor(
    private protectedHeader: CborMap,
    private unprotectedHeader: CborMap,
    public payload: CborMap,
    private signature: ArrayBuffer,
  ) {}

  toBuffer(): Buffer {
    const p = cbor.encodeCanonical(this.protectedHeader)
    const u = this.unprotectedHeader
    const payload = cbor.encode(new cbor.Tagged(10001, this.payload))
    let sig = this.signature
    return cbor.encodeCanonical(new cbor.Tagged(18, [p, u, payload, sig]))
  }

  static fromBuffer(data: Buffer): CoseSign1 {
    const cose = cbor.decodeFirstSync(data, decoders).value
    const protectedHeader = cbor.decodeFirstSync(cose[0])
    const unprotectedHeader = cose[1]
    const payload = cbor.decodeFirstSync(cose[2], decoders).value
    const signature = cose[3]

    return new CoseSign1(protectedHeader, unprotectedHeader, payload, signature)
  }
}