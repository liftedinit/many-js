import cbor from "cbor"
import { Network } from "../network"
import { tag } from "../message/encoding"
import { sha3_224 } from "js-sha3"
import {
  expectedSymbolsMap,
  mockSymbolAddress,
  mockSymbolAddress2,
} from "./modules/ledger/__tests__/data"
import { Ledger } from "./modules"
import { Ed25519KeyPairIdentity } from "../identity"

const globalFetch = global.fetch

describe("network", () => {
  afterAll(() => {
    global.fetch = globalFetch
  })

  test("can get and set URL and KeyPair", () => {
    const testnet = new Network("http://example.com")
    const keys = Ed25519KeyPairIdentity.fromMnemonic(
      Ed25519KeyPairIdentity.getMnemonic(),
    )
    testnet.keys = keys

    expect(testnet.url).toBe("http://example.com")
    expect(testnet.keys).toBe(keys)
  })

  test("getLedgerInfo", async () => {
    // @ts-ignore
    const protectedHeader = new Map([
      [1, -8],
      [
        4,
        Buffer.from(
          "01" +
            sha3_224(
              cbor.encodeCanonical(
                // @ts-ignore
                new Map([
                  [1, 1],
                  [3, -8],
                  [-1, 6],
                  [4, [2]],
                  [-2, Buffer.from([0x00])],
                ]),
              ),
            ),
          "hex",
        ),
      ],
      [
        "keyset",
        cbor.encodeCanonical([
          // @ts-ignore
          new Map([
            [1, 1],
            [2, Buffer.from([0x00])],
            [3, -8],
            [-1, 6],
            [4, [2]],
            [-2, Buffer.from([0x00])],
          ]),
        ]),
      ],
    ])
    const unprotectedHeader = {}
    // @ts-ignore
    const mockContent = new Map([
      [
        4,
        cbor.encode(
          // @ts-ignore
          new Map([[4, new Map([mockSymbolAddress, mockSymbolAddress2])]]),
        ),
      ],
    ])
    const mockCoseResponse = cbor.encodeCanonical(
      tag(18, [
        cbor.encodeCanonical(protectedHeader),
        unprotectedHeader,
        cbor.encode(tag(10001, mockContent)),
        new ArrayBuffer(0),
      ]),
    )

    global.fetch = jest.fn(() =>
      Promise.resolve({
        arrayBuffer: () => Promise.resolve(mockCoseResponse),
      }),
    ) as jest.Mock
    // global.fetch = globalFetch;
    const testnet = new Network("http://example.com")
    testnet.apply([Ledger])
    const res = await testnet.ledger.info()
    expect(res).toEqual(expectedSymbolsMap)
  })

  it("calls fetch when sending a message", async () => {
    const testnet = new Network("http://example.com")

    await testnet.call("heartbeat")
    expect(global.fetch).toHaveBeenCalled()
  })
})
