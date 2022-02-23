import { Network } from "../network";
import { KeyPair } from "../keys";

const globalFetch = global.fetch;

describe("network", () => {
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
    const testnet = new Network("http://example.com");
    const keys = KeyPair.fromMnemonic(KeyPair.getMnemonic());
    testnet.keys = keys;

    expect(testnet.url).toBe("http://example.com");
    expect(testnet.keys).toBe(keys);
  });

  test.skip("calls fetch when sending a message", async () => {
    const testnet = new Network("http://example.com");

    await testnet.send({ method: "heartbeat" });
    expect(global.fetch).toHaveBeenCalled();
  });
});
