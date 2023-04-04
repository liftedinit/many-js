import { KeyPair, KeyValueService, Request } from "..";
import { ID1, SERVERS } from "./data";

describe.skip("KeyValue", () => {
  let server: KeyValueService;

  // it("should send encoded bytes", async () => {
  //   const status = await server.sendEncoded(CBOR_DATA);
  //
  //   expect(status).toBeDefined();
  // });
  // it("should send a request from bytes", async () => {
  //   const req = Request.fromCborData(CBOR_DATA);
  //   const status = await server.send(req);
  //
  //   expect(status).toBeDefined();
  // });
  // it("should send a request from an object", async () => {
  //   const req = Request.fromObject({ method: "status" });
  //   const status = await server.send(req);
  //
  //   expect(status).toBeDefined();
  // });
  // it("should call a method", async () => {
  //   const status = await server.call("status");
  //
  //   expect(status).toBeDefined();
  // });
  it("should contain keyvalue endpoints", async () => {
    server = new KeyValueService(SERVERS.KEYVALUE);

    const { endpoints } = await server.endpoints();
    const isKeyValueService = endpoints.some((e) => e.includes("kvstore"));

    expect(isKeyValueService).toBeTruthy();
  });
  it("should return service info", async () => {
    server = new KeyValueService(SERVERS.KEYVALUE);

    const info = await server.info();

    expect(info.hash).toBeDefined();
  });
  it("should put and get a value", async () => {
    server = new KeyValueService(SERVERS.KEYVALUE, ID1);

    const key = "foo";
    const value = "bar";

    await server.endpoints();

    // await server.put({ key, value });
    // const retrieved = await server.get({ key });
    //
    // expect(retrieved).toBe(value);
  });
});
