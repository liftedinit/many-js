import * as server from "../server";
import { fromSeedWords, getSeedWords } from "../keys";

const globalFetch = global.fetch;

describe("server", () => {
  beforeAll(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ test: 100 }),
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
      })
    ) as jest.Mock;
  });

  afterAll(() => {
    global.fetch = globalFetch;
  });

  test("can get and set URL and KeyPair", () => {
    const testnet = new server.Server("http://example.com");
    const keys = fromSeedWords(getSeedWords());
    testnet.keys = keys;

    expect(testnet.url).toBe("http://example.com");
    expect(testnet.keys).toBe(keys);
  });

  test.skip("calls fetch when sending a message", async () => {
    const testnet = new server.Server("http://example.com");

    const reply = await testnet.send({ method: "heartbeat" });
    expect(global.fetch).toHaveBeenCalled();
  });
});
