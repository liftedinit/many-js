import { Message } from "../../../message"
import { makeRandomBytes } from "../../../utils"
import {
  TokenInfo,
  TokenInfoSummary,
  TokenInfoSupply,
  TokensCreateParam,
  TokensInfoParam,
  TokensModule,
  TokensUpdateParam,
} from "./types"

export const Tokens: TokensModule = {
  _namespace_: "tokens",
  async info(param: TokensInfoParam): Promise<TokenInfo> {
    const data = new Map([[0, param.address]])
    const res = await this.call("tokens.info", data)
    return getTokenInfo(res)
  },
  async create(
    param: TokensCreateParam,
    { nonce } = { nonce: makeRandomBytes(16) },
  ): Promise<TokenInfo> {
    const data = makeTokensCreateData(param)
    const res = await this.call("tokens.create", data, { nonce })
    return getTokenInfo(res)
  },
  async update(
    param: TokensUpdateParam,
    { nonce } = { nonce: makeRandomBytes(16) },
  ): Promise<TokenInfo> {
    const data = makeTokensUpdateData(param)
    const res = await this.call("tokens.update", data, { nonce })
    return getTokenInfo(res)
  },
}

// Make maps from objects

function makeTokensCreateData(param: TokensCreateParam): Map<number, any> {
  const data = new Map()
  data.set(0, makeTokenInfoSummary(param.summary))
  param.owner && data.set(1, param.owner)
  param.distribution && data.set(2, param.distribution)
  param.maximumSupply && data.set(3, param.maximumSupply)
  param.extended && data.set(4, param.extended)
  return data
}

function makeTokensUpdateData(param: TokensUpdateParam): Map<number, any> {
  const data = new Map()
  data.set(0, param.address)
  param.name && data.set(1, param.name)
  param.symbol && data.set(2, param.symbol)
  param.precision && data.set(3, param.precision)
  param.owner && data.set(4, param.owner)
  param.memo && data.set(5, param.memo)
  return data
}

function makeTokenInfoSummary(param: TokenInfoSummary): Map<number, any> {
  const data = new Map()
  data.set(0, param.name)
  data.set(1, param.symbol)
  data.set(2, param.precision)
  return data
}

// Get objects from maps

export function getTokenInfo(message: Message): TokenInfo {
  const data = message.getPayload()
  const result: TokenInfo = {
    address: data.get(0),
    summary: getTokenInfoSummary(data.get(1)),
    supply: getTokenInfoSupply(data.get(2)),
  }
  data.get(3) && (result.owner = data.get(3))
  return result
}

function getTokenInfoSummary(data: Map<number, any>): TokenInfoSummary {
  return {
    name: data.get(0),
    symbol: data.get(1),
    precision: data.get(2),
  }
}

function getTokenInfoSupply(data: Map<number, any>): TokenInfoSupply {
  const result: TokenInfoSupply = {
    total: data.get(0),
    circulating: data.get(1),
  }
  data.get(2) && (result.maximum = data.get(2))
  return result
}
