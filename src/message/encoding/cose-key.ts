import cbor from "cbor";
import { sha3_224 } from "js-sha3";
import { compare, fromString } from "../../shared/utils";
import { CborData, CborMap } from "./cbor";

export const ANONYMOUS = new Uint8Array([0x00]);

export class CoseKey {
  key: CborMap;
  keyId: CborData;
  private common: CborMap;

  // @TODO: Enumerate required parameters
  constructor(commonParams: Map<number, any> = new Map()) {
    this.common = commonParams;
    this.keyId = this.getKeyId();
    this.key = this.getKey();
  }

  get publicKey(): Uint8Array {
    return this.key.get(-2);
  }

  private getKeyId(): CborData {
    if (compare(this.common.get(-2), ANONYMOUS)) {
      return ANONYMOUS;
    }
    const keyId = new Map(this.common);
    const pk = "01" + sha3_224(cbor.encodeCanonical(keyId));
    return fromString(pk, "hex");
  }

  private getKey(): CborMap {
    const key = new Map(this.common);
    key.set(2, this.keyId); // kid: Key ID
    return key;
  }

  toCborData(): CborData {
    return cbor.encodeCanonical([this.key]);
  }
}
