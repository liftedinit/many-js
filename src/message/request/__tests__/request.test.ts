import { Request } from "../request";
import { STATUS_BYTES, STATUS_MAP, STATUS_OBJ } from "./data";

describe("Request", () => {
  test("should be constructed from a map", () => {
    const req = new Request(STATUS_MAP);

    expect(req).toBeInstanceOf(Request);
  });
  test("should be formatted as JSON", () => {
    const req = new Request(STATUS_MAP);
    const json = req.toJSON();

    expect(json).toHaveProperty("method");
    expect(json.method).toBe("status");
  });
  test("should be created from an object", () => {
    const req = Request.fromObject(STATUS_OBJ);

    expect(req).toBeInstanceOf(Request);
  });
  test("should be decoded from CBOR", () => {
    const req = Request.fromCborData(STATUS_BYTES);

    expect(req).toBeInstanceOf(Request);
  });
  test("should be encoded to CBOR", async () => {
    const req = Request.fromCborData(STATUS_BYTES);
    const cbor = await req.toCborData();

    expect(cbor.values).toEqual(STATUS_BYTES.values);
  });
});
