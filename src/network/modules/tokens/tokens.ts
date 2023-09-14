import { Address } from "../../../identity"
import { tag } from "../../../message/cbor"
import { makeRandomBytes } from "../../../utils"
import {
  TokenBasicInfo,
  TokenInfo,
  TokenInfoSummary,
  TokenInfoSupply,
  TokensAddExtendedParam,
  TokensCreateParam,
  TokensInfoParam,
  TokensMintBurnParam,
  TokensModule,
  TokensRemoveExtendedParam,
  TokensUpdateParam,
} from "./types"

export const Tokens: TokensModule = {
  _namespace_: "tokens",
  async info(param: TokensInfoParam): Promise<TokenInfo> {
    const data = new Map([
      [0,Address.fromString(param.address).toBuffer()],
    ])
    const res = await this.call("tokens.info", data)
    const payload = res.getPayload()
    return getTokenInfo(payload)
  },
  async create(
    param: TokensCreateParam,
    { nonce } = { nonce: makeRandomBytes(16) },
  ): Promise<TokenBasicInfo> {
    const data = makeTokensCreateData(param)
    const res = await this.call("tokens.create", data, { nonce })
    const payload = res.getPayload()
    return getTokenBasicInfo(payload.get(0))
  },
  async update(
    param: TokensUpdateParam,
    { nonce } = { nonce: makeRandomBytes(16) },
  ) {
    const data = makeTokensUpdateData(param)
    await this.call("tokens.update", data, { nonce })
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
  async mint(
    param: TokensMintBurnParam,
    { nonce } = { nonce: makeRandomBytes(16) },
  ) {
    return await this.call("tokens.mint", makeTokensMintParam(param), {
      nonce,
    })
  },
  async burn(
    param: TokensMintBurnParam,
    { nonce } = { nonce: makeRandomBytes(16) },
  ) {
    return await this.call("tokens.burn", makeTokensBurnParam(param), {
      nonce,
    })
  },
}

// Make maps from objects

function makeTokensCreateData(param: TokensCreateParam): Map<number, any> {
  const data = new Map()
  const distribution = new Map()
  if (param.distribution) {
    Object.entries(param.distribution).forEach(([address, amount]) => {
      distribution.set(
        Address.fromString(address).toBuffer(),
        amount,
      )
    })
  }
  data.set(0, makeTokenInfoSummary(param.summary))
  param.owner &&
    data.set(1, Address.fromString(param.owner).toBuffer())
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
    data.set(4, Address.fromString(param.owner).toBuffer())
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

function makeTokensMintParam(param: TokensMintBurnParam) {
  const data = new Map()
  data.set(0, param.symbol)
  data.set(1, new Map(Object.entries(param.addresses)))
  return data
}
function makeTokensBurnParam(param: TokensMintBurnParam) {
  const data = new Map()
  data.set(0, param.symbol)
  data.set(1, new Map(Object.entries(param.addresses)))
  data.set(3, true)
  return data
}

// Get objects from maps

export function getTokenInfo(data: Map<number, any>): TokenInfo {
  const result: TokenInfo = {
    info: getTokenBasicInfo(data.get(0)),
  }
  data.get(1) && (result.extended = data.get(1))
  return result
}

function getTokenBasicInfo(data: Map<number, any>): TokenBasicInfo {
  const result: TokenBasicInfo = {
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
