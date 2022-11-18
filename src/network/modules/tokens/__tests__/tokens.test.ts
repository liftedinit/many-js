import { mockTokenInfoMsg, mockTokenAddress, expectedTokenInfo } from "./data"
import { Tokens } from "../tokens"

describe("Tokens", () => {
  describe("info", () => {
    it("should return information for a given token", async () => {
      const mockCall = jest.fn(async () => {
        return mockTokenInfoMsg
      })
      const address = mockTokenAddress
      const tokens = setupTokens(mockCall)
      const actual = await tokens.info({ address })

      expect(mockCall).toHaveBeenCalled()
      expect(actual).toEqual(expectedTokenInfo)
    })
  })
  describe("create", () => {
    it("should return information for the created token", async () => {
      const mockCall = jest.fn(async () => {
        return mockTokenInfoMsg
      })
      const tokens = setupTokens(mockCall)
      const actual = await tokens.create({
        summary: {
          name: "MyToken",
          symbol: "MTK",
          precision: 9,
        },
      })

      expect(mockCall).toHaveBeenCalled()
      expect(actual).toEqual(expectedTokenInfo)
    })
  })
  describe("update", () => {
    it("should return information for the updated token", async () => {
      const mockCall = jest.fn(async () => {
        return mockTokenInfoMsg
      })
      const tokens = setupTokens(mockCall)
      const actual = await tokens.update({
        address: mockTokenAddress,
        name: "OurToken",
        symbol: "OTK",
        precision: 9,
        memo: "Now decentralized!",
      })

      expect(mockCall).toHaveBeenCalled()
      expect(actual).toEqual(expectedTokenInfo)
    })
  })
})

function setupTokens(callImpl?: jest.Mock) {
  const mockCall = callImpl ?? jest.fn()
  const mixedIn = {
    call: mockCall,
    ...Tokens,
  }
  return mixedIn
}
