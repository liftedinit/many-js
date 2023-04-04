import cbor from "cbor";
import { Identifier } from "../../id";
import { tag, CborMap, CborData } from "./cbor";

export const decoders = {
  tags: {
    10000: (value: Uint8Array) => new Identifier(value),
    1: (value: number) => tag(1, value),
  },
};

export class CoseSign1 {
  constructor(
    private protectedHeader: CborMap,
    private unprotectedHeader: CborMap,
    public payload: CborMap,
    private signature: ArrayBuffer,
  ) {}

  toCborData(): CborData {
    const p = this.protectedHeader.size
      ? cbor.encodeCanonical(this.protectedHeader)
      : Buffer.alloc(0);
    const u = this.unprotectedHeader;
    const payload = cbor.encode(new cbor.Tagged(10001, this.payload));
    let sig = this.signature;
    return cbor.encodeCanonical(new cbor.Tagged(18, [p, u, payload, sig]));
  }

  static fromCborData(data: CborData): CoseSign1 {
    const cose = cbor.decodeFirstSync(data, decoders).value;

    const protectedHeader = cose[0].size
      ? cbor.decodeFirstSync(cose[0])
      : new Map();
    const unprotectedHeader = cose[1];
    const payload = cbor.decodeFirstSync(cose[2], decoders).value;
    const signature = cose[3];

    return new CoseSign1(
      protectedHeader,
      unprotectedHeader,
      payload,
      signature,
    );
  }
}
