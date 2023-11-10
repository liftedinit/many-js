import { encodeCanonical as encode } from "cbor-web";
import { sha3_224 } from "js-sha3";
import { compareBytes, hexToBytes } from "../../shared/utils";
import { CborData, CborMap } from "./cbor";

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
    return this.common.get(-2);
  }

  get keyId(): CborData {
    if (compareBytes(this.publicKey, ANONYMOUS)) {
      return ANONYMOUS;
    }
    const pk = "01" + sha3_224(encode(this.common));

    return hexToBytes(pk);
  }

  get key(): CborMap {
    const key = new Map(this.common);
    key.set(2, this.keyId); // kid: Key ID
    return key;
  }

  toCborData(): CborData {
    return encode([this.key]);
  }
}
