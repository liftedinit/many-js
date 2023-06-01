import {
  mockTokenInfoMsg,
  mockTokenAddress,
  mockTokenString,
  expectedTokenInfo,
  mockTokenBasicInfoMsg,
  expectedTokenBasicInfo,
} from "./data"
import { Tokens } from "../tokens"
import { setupModule } from "../../test/test-utils"

describe("Tokens", () => {
  describe("info", () => {
    it("should return information for a given token", async () => {
      const mockCall = jest.fn(async () => mockTokenInfoMsg)
      const tokens = setupModule(Tokens, mockCall)

      const actual = await tokens.info({ address: mockTokenString })

      expect(mockCall).toHaveBeenCalled()
      expect(actual).toEqual(expectedTokenInfo)
    })
  })
  describe("create", () => {
    it("should return information for the created token", async () => {
      const mockCall = jest.fn(async () => mockTokenInfoMsg)
      const tokens = setupModule(Tokens, mockCall)

      const actual = await tokens.create({
        summary: {
          name: "MyToken",
          symbol: "MTK",
          precision: 9,
        },
      })

      expect(mockCall).toHaveBeenCalled()
      expect(actual).toEqual(expectedTokenBasicInfo)
    })
  })
  describe("update", () => {
    it("should return information for the updated token", async () => {
      const mockCall = jest.fn(async () => { })
      const tokens = setupModule(Tokens, mockCall)

      tokens.update({
        address: mockTokenAddress,
        name: "OurToken",
        symbol: "OTK",
        precision: 9,
        memo: ["Now decentralized!"],
      })

      expect(mockCall).toHaveBeenCalled()
    })
  })
  describe("addExtendedInfo", () => {
    it("should return information for the updated token", async () => {
      const mockCall = jest.fn(async () => { })
      const tokens = setupModule(Tokens, mockCall)

      tokens.addExtendedInfo({
        address: mockTokenAddress,
        extended: new Map([[1, Buffer.from("BYTES FOR A PNG")]]),
      })

      expect(mockCall).toHaveBeenCalled()
    })
  })
  describe("removeExtendedInfo", () => {
    it("should return information for the updated token", async () => {
      const mockCall = jest.fn(async () => { })
      const tokens = setupModule(Tokens, mockCall)

      tokens.removeExtendedInfo({
        address: mockTokenAddress,
        indices: [1],
      })

      expect(mockCall).toHaveBeenCalled()
    })
  })
  describe("mint", () => {
    it("should mint some tokens", async () => {
      const mockCall = jest.fn(async () => { })
      const tokens = setupModule(Tokens, mockCall)

      const symbol = mockTokenString
      const addresses = { maa: BigInt(1000) }
      tokens.mint({ symbol, addresses })

      expect(mockCall).toHaveBeenCalled()
    })
  })
  describe("burn", () => {
    it("should burn some tokens", async () => {
      const mockCall = jest.fn(async () => { })
      const tokens = setupModule(Tokens, mockCall)

      const symbol = mockTokenString
      const addresses = { maa: BigInt(1000) }
      tokens.burn({ symbol, addresses })

      expect(mockCall).toHaveBeenCalled()
    })
  })
})
