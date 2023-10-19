import { encode } from "cbor-web";
import { sha3_224 } from "js-sha3";
import {
  CborData,
  cborDataFromString,
  cborDataToString,
  CborMap,
  compare,
  // encode,
} from "./cbor";

export const ANONYMOUS = new Uint8Array([0x00]);

enum CoseKeyParameters {
  kty = 1,
  alg = 3,
  key_ops = 4,
  crv = -1,
  x = -2,
}

export class CoseKey {
  constructor(private common: Map<CoseKeyParameters, any> = new Map()) { }

  get publicKey(): Uint8Array {
    return this.key.get(-2);
  }

  get keyId(): CborData {
    if (compare(this.common.get(-2), ANONYMOUS)) {
      return ANONYMOUS;
    }
    const keyId = new Map(this.common);
    const pk = "01" + sha3_224(encode(keyId));

    return Buffer.from(pk, "hex");
    // return cborDataFromString(pk, "hex");
  }

  get key(): CborMap {
    const key = new Map(this.common);
    key.set(2, this.keyId); // kid: Key ID
    return key;
  }

  // @TODO: Replace all instances of coseKey.toCborData() with encode(coseKey)
  toCborData(): CborData {
    return encode([this.key]);
  }
}
