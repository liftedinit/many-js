import { Address } from "../../../../identity"
import { identityStr1, makeMockResponseMessage } from "../../test/test-utils"

export const mockTokenAddress = Address.fromString(identityStr1)

export const mockTokenInfoMsg = makeMockResponseMessage(
  new Map()
    .set(0, mockTokenAddress)
    .set(1, new Map().set(0, "MyToken").set(1, "MTK").set(2, 9))
    .set(2, new Map().set(0, 100000000).set(1, 99999999)),
)

export const expectedTokenInfo = {
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
