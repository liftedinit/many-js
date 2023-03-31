import { BaseService, Request } from "..";
import { fromString } from "../shared/utils";
import { ID1, SERVERS } from "./data";

describe("BaseService", () => {
  const HEX = "D28440a053d92711a2036673746174757305c11a64234ee740";
  const CBOR_DATA = fromString(HEX, "hex");

  const server = new BaseService(SERVERS.LEDGER);

  it("should send encoded bytes", async () => {
    const status = await server.sendEncoded(CBOR_DATA);

    expect(status).toBeDefined();
  });
  it("should send a request from bytes", async () => {
    const req = Request.fromCborData(CBOR_DATA);
    const status = await server.send(req);

    expect(status).toBeDefined();
  });
  it("should send a request from an object", async () => {
    const req = Request.fromObject({ method: "status" });
    const status = await server.send(req);

    expect(status).toBeDefined();
  });
  it("should call a method", async () => {
    const status = await server.call("status");

    expect(status).toBeDefined();
  });
  it("should call a method from a shortcut", async () => {
    const status = await server.status();

    expect(status).toBeDefined();
  });
  it("should call a method non-anonymously", async () => {
    const id1Server = new BaseService(SERVERS.LEDGER, ID1);
    const status = await id1Server.status();

    expect(status).toBeDefined();
  });
});
