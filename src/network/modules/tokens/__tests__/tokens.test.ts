import {
  mockTokensInfoResponseMessage,
  mockTokenAddress,
  expectedTokenInfo,
} from "./data"
import { Tokens } from "../tokens"

describe("Tokens", () => {
  describe("info", () => {
    it("should return information for a given token", async () => {
      const mockCall = jest.fn(async () => {
        return mockTokensInfoResponseMessage
      })
      const address = mockTokenAddress
      const tokens = setupTokens(mockCall)
      const actual = await tokens.info({ address })

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
