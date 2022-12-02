import { Address } from "../../../identity"
import { Message } from "../../../message"
import { tag } from "../../../message/cbor"
import { makeRandomBytes } from "../../../utils"
import {
  TokenInfo,
  TokenInfoSummary,
  TokenInfoSupply,
  TokensAddExtendedParam,
  TokensCreateParam,
  TokensInfoParam,
  TokensModule,
  TokensRemoveExtendedParam,
  TokensUpdateParam,
} from "./types"

export const Tokens: TokensModule = {
  _namespace_: "tokens",
  async info(param: TokensInfoParam): Promise<TokenInfo> {
    const data = new Map([
      [0, tag(10000, Address.fromString(param.address).toBuffer())],
    ])
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
  async addExtendedInfo(
    param: TokensAddExtendedParam,
    { nonce } = { nonce: makeRandomBytes(16) },
  ) {
    const data = makeTokensAddExtendedData(param)
    await this.call("tokens.addExtendedInfo", data, { nonce })
  },
  async removeExtendedInfo(
    param: TokensRemoveExtendedParam,
    { nonce } = { nonce: makeRandomBytes(16) },
  ) {
    const data = makeTokensRemoveExtendedData(param)
    await this.call("tokens.removeExtendedInfo", data, { nonce })
  },
}

// Make maps from objects

function makeTokensCreateData(param: TokensCreateParam): Map<number, any> {
  const data = new Map()
  const distribution = new Map()
  if (param.distribution) {
    Object.entries(param.distribution).forEach(([address, amount]) => {
      distribution.set(
        tag(10000, Address.fromString(address).toBuffer()),
        amount,
      )
    })
  }
  data.set(0, makeTokenInfoSummary(param.summary))
  param.owner &&
    data.set(1, tag(10000, Address.fromString(param.owner).toBuffer()))
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
  param.owner &&
    data.set(4, tag(10000, Address.fromString(param.owner).toBuffer()))
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

function makeTokensAddExtendedData(
  param: TokensAddExtendedParam,
): Map<number, any> {
  const data = new Map()
  data.set(0, param.address)
  data.set(1, param.extended)
  return data
}

function makeTokensRemoveExtendedData(
  param: TokensRemoveExtendedParam,
): Map<number, any> {
  const data = new Map()
  data.set(0, param.address)
  data.set(1, param.indices)
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
