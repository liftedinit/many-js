import { encode, Tagged, decodeFirstSync } from "cbor-web";
import { CborMap, CborData } from "./cbor";

export class CoseSign1 {
  constructor(
    private protectedHeader: CborMap,
    private unprotectedHeader: CborMap,
    public payload: CborMap,
    private signature: ArrayBuffer,
  ) { }

  toCborData(): CborData {
    const p = this.protectedHeader.size
      ? encode(this.protectedHeader)
      : new ArrayBuffer(0);
    const u = this.unprotectedHeader;
    const payload = encode(new Tagged(10001, this.payload));
    const sig = this.signature;

    return encode(new Tagged(18, [p, u, payload, sig]));
  }

  static fromCborData(data: CborData): CoseSign1 {
    let [p, u, payload, sig] = decodeFirstSync(data).value;
    p = p.size ? decodeFirstSync(p) : new Map();
    payload = payload ? decodeFirstSync(payload).value : new Map();

    return new CoseSign1(p, u, payload, sig);
  }
}
