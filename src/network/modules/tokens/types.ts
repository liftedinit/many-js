import { Address } from "../../../identity"
import { NetworkModule } from "../types"

type LedgerAmount = BigInt

export interface TokenInfoSummary {
  name: string
  symbol: string
  precision: number
}

export interface TokenInfoSupply {
  total: LedgerAmount
  circulating: LedgerAmount
  maximum?: LedgerAmount
}

export interface TokenInfo {
  address: Address
  summary: TokenInfoSummary
  supply: TokenInfoSupply
  owner?: Address
}

export interface TokensInfoParam {
  address: Address
}

export interface TokensCreateParam {
  summary: TokenInfoSummary
  owner?: Address
  distribution?: Map<Address, LedgerAmount>
  maximumSupply?: LedgerAmount
  extended?: Map<number, any>
}

export interface TokensUpdateParam {
  address: Address
  name?: string
  symbol?: string
  precision?: number
  owner?: Address | null
  memo?: string
}

export interface TokensModule extends NetworkModule {
  info: (data: TokensInfoParam) => Promise<TokenInfo>
  create: (
    data: TokensCreateParam,
    opts: { nonce?: ArrayBuffer },
  ) => Promise<TokenInfo>
  update: (
    data: TokensUpdateParam,
    opts: { nonce?: ArrayBuffer },
  ) => Promise<TokenInfo>
}
