import { Ledger } from "../../ledger"
import {
  mockBalanceMap,
  mockBalanceObj,
  mockInfoMap,
  mockInfoObj,
} from "./data"

const mockCall = jest.spyOn(Ledger.prototype, "call")
const server = new Ledger("localhost")

describe("ledger", () => {
  describe("info", () => {
    it("should return information about the ledger service", async () => {
      mockCall.mockResolvedValue(mockInfoMap)
      const info = await server.info()

      expect(info).toStrictEqual(mockInfoObj)
    })
  })
  describe("balance", () => {
    it("should return balances", async () => {
      mockCall.mockResolvedValue(mockBalanceMap)
      const balances = await server.balance()

      expect(balances).toStrictEqual(mockBalanceObj)
    })
  })
})
