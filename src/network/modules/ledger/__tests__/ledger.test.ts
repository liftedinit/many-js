import { getLedgerInfo, getBalance, Ledger } from "../ledger"
import {
  expectedBalancesMap,
  expectedSymbolsMap,
  mockLedgerInfoResponseMessage,
  mockLedgerBalanceResponseMessage,
} from "./data"

describe("Ledger", () => {
  describe("info()", () => {
    it("calling ledger.info() return symbols", async () => {
      const mockCall = jest.fn(async () => {
        return mockLedgerInfoResponseMessage
      })
      const ledger = setupLedger(mockCall)
      const res = await ledger.info()
      expect(mockCall).toHaveBeenCalledTimes(1)
      expect(mockCall).toHaveBeenCalledWith("ledger.info")
      expect(res).toEqual(expectedSymbolsMap)
    })
    it("getLedgerInfo() should return symbols", async () => {
      const res = getLedgerInfo(mockLedgerInfoResponseMessage)
      expect(res).toEqual(expectedSymbolsMap)
    })
  })

  describe("balance()", () => {
    it("should call ledger.balance() with an empty list of token identities", async () => {
      const mockCall = jest.fn(async () => {
        return mockLedgerBalanceResponseMessage
      })
      const ledger = setupLedger(mockCall)
      const res = await ledger.balance()
      expect(mockCall).toHaveBeenCalledTimes(1)
      expect(mockCall).toHaveBeenCalledWith(
        "ledger.balance",
        new Map([[1, []]]),
      )
      expect(res).toEqual(expectedBalancesMap)
    })
    it("should call ledger.balance() with a list of token identities ", async () => {
      const mockCall = jest.fn(async () => {
        return mockLedgerBalanceResponseMessage
      })
      const ledger = setupLedger(mockCall)
      await ledger.balance(undefined, ["abc", "def"])
      expect(mockCall).toHaveBeenCalledTimes(1)
      expect(mockCall).toHaveBeenCalledWith(
        "ledger.balance",
        new Map([[1, ["abc", "def"]]]),
      )
    })
    it("getBalance() should return balances", async () => {
      const res = getBalance(mockLedgerBalanceResponseMessage)
      expect(res).toEqual(expectedBalancesMap)
    })
  })
})

function setupLedger(callImpl?: jest.Mock) {
  const mockCall = callImpl ?? jest.fn()
  const mixedIn = {
    call: mockCall,
    ...Ledger,
  }
  return mixedIn
}
