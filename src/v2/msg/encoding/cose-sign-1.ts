import cbor from "cbor"
import { Address, Identity, PublicKeyIdentity } from "../../identity"

export const ANONYMOUS = Buffer.from([0x00])
export const EMPTY = Buffer.alloc(0)

type CborMap = Map<number | string, any>

export const decoders = {
  tags: {
    10000: (value: Uint8Array) => new Address(Buffer.from(value)),
    1: (value: number) => new cbor.Tagged(1, value),
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

  // @TODO: Deprecate knowledge of identities in CoseSign1
  static getProtectedHeader(identity: PublicKeyIdentity | Identity): CborMap {
    let protectedHeader = new Map()
    if ("getCoseKey" in identity) {
      const coseKey = identity.getCoseKey()
      protectedHeader.set(1, coseKey.key.get(3)) // alg
      protectedHeader.set(4, coseKey.keyId) // kid: kid
      protectedHeader.set("keyset", coseKey.toBuffer())
      if (typeof identity?.getProtectedHeader === "function") {
        protectedHeader = new Map([
          ...protectedHeader,
          ...identity.getProtectedHeader(),
        ])
      }
    }
    return protectedHeader
  }
}
