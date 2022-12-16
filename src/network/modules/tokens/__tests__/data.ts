import { Address } from "../../../../identity"
import { identityStr1, makeMockResponseMessage } from "../../test/test-utils"

export const mockTokenAddress = Address.fromString(identityStr1)
export const mockTokenString = identityStr1

export const mockTokenBasicInfo = new Map<number, any>([
  [0, mockTokenAddress],
  [
    1,
    new Map<number, any>([
      [0, "MyToken"],
      [1, "MTK"],
      [2, 9],
    ]),
  ],
  [
    2,
    new Map<number, any>([
      [0, 100000000],
      [1, 99999999],
    ]),
  ],
])

export const mockTokenBasicInfoMsg = makeMockResponseMessage(mockTokenBasicInfo)

export const mockTokenInfoMsg = makeMockResponseMessage(
  new Map([[0, mockTokenBasicInfo]]),
)

export const expectedTokenBasicInfo = {
  address: mockTokenAddress,
  summary: {
    name: "MyToken",
    symbol: "MTK",
    precision: 9,
  },
  supply: {
    total: 100000000,
    circulating: 99999999,
  },
}

export const expectedTokenInfo = {
  info: expectedTokenBasicInfo,
}
