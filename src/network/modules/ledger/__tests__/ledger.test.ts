import cbor from "cbor"
import { getLedgerInfo } from ".."
import { Message } from "../../../../message"
import {
  expectedSymbolsMap,
  mockSymbolIdentity,
  mockSymbolIdentity2,
} from "./data"

describe("Ledger", () => {
  it("getLedgerInfo should return symbols", async () => {
    const mockContent = new Map([
      [
        4,
        cbor.encode(
          new Map([
            [
              4,
              // @ts-ignore
              new Map([mockSymbolIdentity, mockSymbolIdentity2]),
            ],
          ]),
        ),
      ],
    ])
    const message = new Message(mockContent)
    const res = getLedgerInfo(message)
    expect(res).toEqual(expectedSymbolsMap)
  })
})
