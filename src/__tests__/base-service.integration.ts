import { BaseService, Request } from "..";
import { CborData } from "../message/encoding";
import { hexToBytes } from "../shared/utils";
import { ID1, SERVERS } from "./data";

describe("BaseService", () => {
  let server: BaseService;
  let HEX: string;
  let CBOR_DATA: CborData;

  beforeAll(() => {
    const timestamp = Math.floor(Date.now() / 1000).toString(16);
    HEX = `d28440a053d92711a2036673746174757305c11a${timestamp}40`;
    CBOR_DATA = hexToBytes(HEX);
  });

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
  it("should attach an identity to an existing server", async () => {
    server = new BaseService(SERVERS.LEDGER);
    const status = await server.as(ID1).status();

    expect(status).toBeDefined();
  });
});
