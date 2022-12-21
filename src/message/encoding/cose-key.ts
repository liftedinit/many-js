import cbor from "cbor"
import { sha3_224 } from "js-sha3"

import { CborMap, CborData } from "./cbor"
import { Address } from "../../identity"

export const ANONYMOUS = Buffer.from([0x00])

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
