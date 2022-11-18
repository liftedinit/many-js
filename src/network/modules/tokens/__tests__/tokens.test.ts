import { mockTokenInfoMsg, mockTokenAddress, expectedTokenInfo } from "./data"
import { Tokens } from "../tokens"
import { setupModule } from "../../test/test-utils"

describe("Tokens", () => {
  const mockCall = jest.fn(async () => mockTokenInfoMsg)
  const tokens = setupModule(Tokens, mockCall)

  describe("info", () => {
    it("should return information for a given token", async () => {
      const address = mockTokenAddress
      const actual = await tokens.info({ address })

      expect(mockCall).toHaveBeenCalled()
      expect(actual).toEqual(expectedTokenInfo)
    })
  })
  describe("create", () => {
    it("should return information for the created token", async () => {
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
