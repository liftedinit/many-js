import { BaseService, Request } from "..";
import { ID1, SERVERS } from "./data";

describe("BaseService", () => {
  const HEX = "d28440a053d92711a2036673746174757305c11a64234ee740";
  const CBOR_DATA = Buffer.from(HEX, "hex");

  let server: BaseService;

  it("should send encoded bytes", async () => {
    server = new BaseService(SERVERS.LEDGER);
    const status = await server.sendEncoded(CBOR_DATA);

    expect(status).toBeDefined();
  });
  it("should send a request from bytes", async () => {
    server = new BaseService(SERVERS.LEDGER);
    const req = Request.fromCborData(CBOR_DATA);
    const status = await server.send(req);

    expect(status).toBeDefined();
  });
  it("should send a request from an object", async () => {
    server = new BaseService(SERVERS.LEDGER);
    const req = Request.fromObject({ method: "status" });
    const status = await server.send(req);

    expect(status).toBeDefined();
  });
  it("should call a method", async () => {
    server = new BaseService(SERVERS.LEDGER);
    const status = await server.call("status");

    expect(status).toBeDefined();
  });
  it("should call a method from a shortcut", async () => {
    server = new BaseService(SERVERS.LEDGER);
    const status = await server.status();

    expect(status).toBeDefined();
  });
  it("should call a method non-anonymously", async () => {
    server = new BaseService(SERVERS.LEDGER, ID1);
    const status = await server.status();

    expect(status).toBeDefined();
  });
});
