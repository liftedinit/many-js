import {
  getLedgerInfo,
  getBalance,
  Ledger,
  makeListFilters,
  OrderType,
  BoundType,
  setRangeBound,
  RangeType,
} from "../ledger"
import {
  expectedBalancesMap,
  expectedSymbolsMap,
  mockLedgerInfoResponseMessage,
  mockLedgerBalanceResponseMessage,
  mockLedgeListResponseMessage,
  expectedListResponse,
} from "./data"

describe("Ledger", () => {
  describe("ledger.info()", () => {
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

  describe("ledger.balance()", () => {
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

  describe("ledger.list", () => {
    it("should return count and list of transactions", async () => {
      const mockCall = jest.fn(async () => {
        return mockLedgeListResponseMessage
      })
      const ledger = setupLedger(mockCall)
      const res = await ledger.list()
      expect(res).toEqual(expectedListResponse)
    })
    it("should be called with correct args", async () => {
      const mockCall = jest.fn(async () => {
        return mockLedgeListResponseMessage
      })
      const ledger = setupLedger(mockCall)
      await ledger.list()
      expect(mockCall).toHaveBeenCalledWith(
        "ledger.list",
        // @ts-ignore
        new Map([
          [0, 10],
          [1, 2],
          [2, new Map()],
        ]),
      )

      mockCall.mockReset()
      mockCall.mockResolvedValueOnce(mockLedgeListResponseMessage)
      const txnId = new Uint8Array(Buffer.from("txn"))
      await ledger.list({
        order: OrderType.ascending,
        count: 20,
        filters: {
          symbols: "symbol1",
          accounts: "account1",
          txnIdRange: [
            undefined,
            { boundType: BoundType.exclusive, value: txnId },
          ],
        },
      })
      expect(mockCall).toHaveBeenCalledWith(
        "ledger.list",
        // @ts-ignore
        new Map([
          [0, 20],
          [1, OrderType.ascending],
          [
            2,
            // @ts-ignore
            new Map([
              [0, "account1"],
              [2, "symbol1"],
              [3, new Map([[1, [1, txnId]]])],
            ]),
          ],
        ]),
      )
    })
  })
  describe("makeListFilters", () => {
    it("should construct the filters", () => {
      const txnId = new Uint8Array(Buffer.from("txnid1"))
      const accounts = "account1"
      const symbols = "symbol1"
      const filters = makeListFilters({
        accounts,
        symbols,
        txnIdRange: [
          undefined,
          { boundType: BoundType.exclusive, value: txnId },
        ],
      })
      expect(filters).toEqual(
        //@ts-ignore
        new Map([
          [0, accounts],
          [2, symbols],
          [3, new Map([[1, [1, txnId]]])],
        ]),
      )

      const filters2 = makeListFilters({
        accounts,
        symbols,
        txnIdRange: [
          { boundType: BoundType.inclusive, value: txnId },
          undefined,
        ],
      })
      expect(filters2).toEqual(
        // @ts-ignore
        new Map([
          [0, accounts],
          [2, symbols],
          [3, new Map([[0, [0, txnId]]])],
        ]),
      )
    })
  })
  describe("setRangeBound", () => {
    it("should make bound range", () => {
      let map = new Map()
      setRangeBound({
        rangeMap: map,
        rangeType: RangeType.lower,
        boundType: BoundType.exclusive,
        value: "123",
      })
      expect(map).toEqual(new Map([[0, [1, "123"]]]))

      map = new Map()
      setRangeBound({
        rangeMap: map,
        rangeType: RangeType.upper,
        boundType: BoundType.inclusive,
        value: "123",
      })
      expect(map).toEqual(new Map([[1, [0, "123"]]]))

      map = new Map()
      setRangeBound({
        rangeMap: map,
        rangeType: RangeType.upper,
        boundType: BoundType.unbounded,
        value: "123",
      })
      expect(map).toEqual(new Map([[1, []]]))
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
