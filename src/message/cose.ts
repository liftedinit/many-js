import cbor from "cbor"
import { sha3_224 } from "js-sha3"
import {
  Address,
  AnonymousIdentity,
  Identity,
  PublicKeyIdentity,
} from "../identity"
import { Message } from "../message"
import { CborData, CborMap, tag } from "./cbor"
import { HIGH_WATER_MARK } from "../const"

export const ANONYMOUS = Buffer.from([0x00])
export const EMPTY = Buffer.alloc(0)

export const decoders = {
  tags: {
    10000: (value: Uint8Array) => new Address(Buffer.from(value)),
    1: (value: number) => tag(1, value),
  },
}

export class CoseMessage {
  protectedHeader: CborMap
  unprotectedHeader: CborMap
  content: CborMap
  signature: Buffer

  constructor(
    protectedHeader: CborMap,
    unprotectedHeader: CborMap,
    content: CborMap,
    signature: Buffer, // WARN: Buffer required to avoid array tagging by cbor library.
  ) {
    this.protectedHeader = protectedHeader
    this.unprotectedHeader = unprotectedHeader
    this.content = content
    this.signature = signature
  }

  static fromCborData(data: CborData): CoseMessage {
    const cose = cbor.decodeFirstSync(data, decoders).value
    const protectedHeader = cose[0]?.length
      ? cbor.decodeFirstSync(cose[0])
      : cose[0]
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
    const protectedHeader = await this.getProtectedHeader(identity)
    const cborProtectedHeader = cbor.encodeCanonical(protectedHeader)
    const content = message.getContent()
    const cborContent = cbor.encodeOne(tag(10001, content), {
      highWaterMark: HIGH_WATER_MARK,
    } as Object)

    const toBeSigned = cbor.encodeOne(
      ["Signature1", cborProtectedHeader, EMPTY, cborContent],
      { highWaterMark: HIGH_WATER_MARK } as Object,
    )

    const unprotectedHeader = await identity.getUnprotectedHeader(
      cborContent,
      cborProtectedHeader,
    )
    const signature = await identity.sign(toBeSigned, unprotectedHeader)

    return new CoseMessage(
      protectedHeader,
      unprotectedHeader,
      content,
      Buffer.from(signature), // WARN: Buffer required to avoid array tagging by cbor library.
    )
  }

  private static async getProtectedHeader(
    identity: PublicKeyIdentity | Identity,
  ): Promise<CborMap> {
    let protectedHeader = new Map()
    if ("getCoseKey" in identity) {
      const coseKey = identity.getCoseKey()
      protectedHeader.set(1, coseKey.key.get(3)) // alg
      protectedHeader.set(4, coseKey.keyId) // kid: kid
      protectedHeader.set("keyset", coseKey.toCborData())
      if (typeof identity?.getProtectedHeader === "function") {
        protectedHeader = new Map([
          ...protectedHeader,
          ...(await identity.getProtectedHeader()),
        ])
      }
    }
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
    const payload = cbor.encodeOne(tag(10001, this.content), {
      highWaterMark: HIGH_WATER_MARK,
    } as Object)
    const protectedHeader = cbor.encodeOne(this.protectedHeader)
    return cbor.encodeOne(
      tag(18, [
        protectedHeader,
        this.unprotectedHeader,
        payload,
        this.signature,
      ]),
      { highWaterMark: HIGH_WATER_MARK } as Object,
    )
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
    // encodeCanonical will encode the map in sorted order
    return cbor.encodeCanonical([this.key])
  }

  toAddress(): Address {
    return new Address(this.keyId)
  }
}
