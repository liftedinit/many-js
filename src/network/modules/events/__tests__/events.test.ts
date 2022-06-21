import {
  Events,
  makeListFilters,
  OrderType,
  BoundType,
  setRangeBound,
  RangeType,
} from "../events"
import {
  mockEventsListSendTxnResponseMessage,
  expectedMockEventsListSendResponse,
  mockEventsListMultisigSubmitEventResponse,
  expectedMockEventsListMultisigSubmitEventResponse,
  mockEventsListMultisigTxnsResponse,
  expectedMockEventsListMultisigTxnsResponse,
  expectedMockEventsListCreateAccountResponse,
  mockEventsListCreateAccountResponse,
  mockEventInfoResponseMessage,
  expectedMockEventInfoResponse,
} from "./data"

describe("Events", () => {
  describe("info()", () => {
    it("return count and supported events", async () => {
      const mockCall = jest.fn(async () => {
        return mockEventInfoResponseMessage
      })
      const events = setupEvents(mockCall)
      const res = await events.info()
      expect(mockCall).toHaveBeenCalledTimes(1)
      expect(mockCall).toHaveBeenCalledWith("events.info")
      expect(res).toEqual(expectedMockEventInfoResponse)
    })
  })

  describe("list()", () => {
    it("should return count and list of send events", async () => {
      const mockCall = jest.fn(async () => {
        return mockEventsListSendTxnResponseMessage
      })
      const events = setupEvents(mockCall)
      const res = await events.list()
      expect(res).toEqual(expectedMockEventsListSendResponse)
    })
    it("should return count and list of multisigSubmit events", async () => {
      const mockCall = jest.fn(async () => {
        return mockEventsListMultisigSubmitEventResponse
      })
      const events = setupEvents(mockCall)
      const res = await events.list()
      expect(res).toEqual(expectedMockEventsListMultisigSubmitEventResponse)
    })
    it("should return multisig approve, revoke, execute, withdraw events", async function () {
      const mockCall = jest.fn(async () => {
        return mockEventsListMultisigTxnsResponse
      })
      const events = setupEvents(mockCall)
      const res = await events.list()
      expect(res).toEqual(expectedMockEventsListMultisigTxnsResponse)
    })
    it("should return create account transaction", async function () {
      const mockCall = jest.fn(async () => {
        return mockEventsListCreateAccountResponse
      })
      const events = setupEvents(mockCall)
      const res = await events.list()
      expect(res).toEqual(expectedMockEventsListCreateAccountResponse)
    })
    it("should be called with correct args", async () => {
      const mockCall = jest.fn(async () => {
        return mockEventsListSendTxnResponseMessage
      })
      const events = setupEvents(mockCall)
      await events.list()
      expect(mockCall).toHaveBeenCalledWith(
        "events.list",
        // @ts-ignore
        new Map([
          [0, 10],
          [1, 2],
          [2, new Map()],
        ]),
      )

      mockCall.mockReset()
      mockCall.mockResolvedValueOnce(mockEventsListSendTxnResponseMessage)
      const txnId = new Uint8Array(Buffer.from("txn"))
      await events.list({
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
        "events.list",
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

function setupEvents(callImpl?: jest.Mock) {
  const mockCall = callImpl ?? jest.fn()
  const mixedIn = {
    call: mockCall,
    ...Events,
  }
  return mixedIn
}
