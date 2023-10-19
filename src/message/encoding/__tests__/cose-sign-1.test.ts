import { CoseSign1 } from "../cose-sign-1";
import { STATUS_BYTES } from "./data";

describe("CoseSign1", () => {
  it("should construct a CoseSign1", () => {
    const cosesign1 = new CoseSign1(
      new Map(),
      new Map(),
      new Map(),
      new ArrayBuffer(0),
    );

    expect(cosesign1).toBeInstanceOf(CoseSign1);
  });
  it("should be encoded to CBOR", () => {
    const cosesign1 = new CoseSign1(
      new Map(),
      new Map(),
      new Map(),
      new ArrayBuffer(0),
    );
    const cbor = cosesign1.toCborData();

    expect(cbor).toBeDefined();
  });
  it("should be decoded from CBOR", () => {
    const cosesign1 = CoseSign1.fromCborData(STATUS_BYTES);

    expect(cosesign1).toBeInstanceOf(CoseSign1);
    expect(cosesign1.payload.get(3)).toBe("status");
  });
});
