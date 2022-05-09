import cbor from "cbor";
import { sha3_224 } from "js-sha3";
import { Address, AnonymousIdentity, Identity } from "../identity"
import { Message } from "../message"
import { CborData, CborMap, tag } from "./cbor"

export const ANONYMOUS = Buffer.from([0x00])
export const EMPTY = Buffer.alloc(0)

export class CoseMessage {
  protectedHeader: CborMap
  unprotectedHeader: CborMap
  content: CborMap
  signature: ArrayBuffer

  constructor(
    protectedHeader: CborMap,
    unprotectedHeader: CborMap,
    content: CborMap,
    signature: ArrayBuffer,
  ) {
    this.protectedHeader = protectedHeader
    this.unprotectedHeader = unprotectedHeader
    this.content = content
    this.signature = signature
  }

  static fromCborData(data: CborData): CoseMessage {
    const decoders = {
      tags: {
        10000: (value: Uint8Array) => new Address(Buffer.from(value)),
        1: (value: number) => tag(1, value),
      },
    }
    const cose = cbor.decodeFirstSync(data, decoders).value
    const protectedHeader = cbor.decodeFirstSync(cose[0])
    const unprotectedHeader = cose[1]
    const content = cbor.decodeFirstSync(cose[2], decoders).value
    const signature = cose[3]

    return new CoseMessage(
      protectedHeader,
      unprotectedHeader,
      content,
      signature,
    )
  }

  static async fromMessage(
    message: Message,
    identity: Identity = new AnonymousIdentity(),
  ): Promise<CoseMessage> {
    const protectedHeader = this.getProtectedHeader(identity)
    const cborProtectedHeader = cbor.encodeCanonical(protectedHeader)
    const content = message.content
    const cborContent = cbor.encode(tag(10001, message.content))
    const toBeSigned = cbor.encodeCanonical([
      "Signature1",
      cborProtectedHeader,
      EMPTY,
      cborContent,
    ])
    const unprotectedHeader = await identity.getUnprotectedHeader(
      cborContent,
      cborProtectedHeader,
    )
    const signature = await identity.sign(toBeSigned, unprotectedHeader)

    return new CoseMessage(
      protectedHeader,
      unprotectedHeader,
      // @ts-ignore
      await identity.getContent(content, unprotectedHeader),
      signature,
    )
  }

  private static getProtectedHeader(identity: Identity): CborMap {
    const coseKey = identity.getCoseKey()
    const protectedHeader = new Map()
    protectedHeader.set(1, coseKey.key.get(3)) // alg
    protectedHeader.set(4, coseKey.keyId) // kid: kid
    protectedHeader.set("keyset", coseKey.toCborData())
    return protectedHeader
  }

  private replacer(key: string, value: any) {
    if (value?.type === "Buffer") {
      return Buffer.from(value.data).toString("hex")
    } else if (value instanceof Map) {
      return Object.fromEntries(value.entries())
    } else if (typeof value === "bigint") {
      return parseInt(value.toString())
    } else if (key === "hash") {
      return Buffer.from(value).toString("hex")
    } else {
      return value
    }
  }

  toCborData(): CborData {
    const p = cbor.encodeCanonical(this.protectedHeader)
    const u = this.unprotectedHeader
    const payload = cbor.encode(tag(10001, this.content))
    let sig = this.signature
    return cbor.encodeCanonical(tag(18, [p, u, payload, sig]))
  }

  toString(): string {
    return JSON.stringify(
      [
        this.protectedHeader,
        this.unprotectedHeader,
        this.content,
        this.signature,
      ],
      this.replacer,
      2,
    )
  }
}

export class CoseKey {
  key: CborMap
  keyId: CborData
  private common: CborMap

  constructor(commonParams: Map<number, any> = new Map()) {
    this.common = commonParams
    this.keyId = this.getKeyId()
    this.key = this.getKey()
  }

  private getKeyId() {
    if (Buffer.compare(this.common.get(-2), ANONYMOUS) === 0) {
      return ANONYMOUS
    }
    const keyId = new Map(this.common)
    const pk = "01" + sha3_224(cbor.encodeCanonical(keyId))
    return Buffer.from(pk, "hex")
  }

  private getKey() {
    const key = new Map(this.common)
    key.set(2, this.keyId) // kid: Key ID
    return key
  }

  toCborData(): CborData {
    return cbor.encodeCanonical([this.key])
  }

  toAddress(): Address {
    return new Address(this.keyId)
  }
}
