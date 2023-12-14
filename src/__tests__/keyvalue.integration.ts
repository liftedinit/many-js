import { KeyPair, KeyValueService, Request } from "..";
import { ID1, SERVERS } from "./data";

describe("KeyValue", () => {
  let server: KeyValueService;

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

    await server.put({ key, value });
    const { value: actual } = await server.get({ key });

    expect(actual).toBe(value);
  });
});
