import { Address } from "../../../identity"
import { NetworkModule } from "../types"

type LedgerAmount = BigInt
type AttrIndex = number | [number, AttrIndex]

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

export type TokenExtendedInfo = Map<AttrIndex, any>

export interface TokensInfoParam {
  address: string
}

export interface TokensCreateParam {
  summary: TokenInfoSummary
  owner?: string | null
  distribution?: { [address: string]: LedgerAmount }
  maximumSupply?: LedgerAmount
  extended?: TokenExtendedInfo
}

export interface TokensUpdateParam {
  address: Address
  name?: string
  symbol?: string
  precision?: number
  owner?: string | null
  memo?: string
}

export interface TokensAddExtendedParam {
  address: Address
  extended: TokenExtendedInfo
}

export interface TokensRemoveExtendedParam {
  address: Address
  indices: AttrIndex[]
}

export interface TokensModule extends NetworkModule {
  info: (data: TokensInfoParam) => Promise<TokenInfo>
  create: (
    data: TokensCreateParam,
    opts?: { nonce?: ArrayBuffer },
  ) => Promise<TokenInfo>
  update: (
    data: TokensUpdateParam,
    opts?: { nonce?: ArrayBuffer },
  ) => Promise<TokenInfo>
  addExtendedInfo: (
    data: TokensAddExtendedParam,
    opts?: { nonce?: ArrayBuffer },
  ) => void
  removeExtendedInfo: (
    data: TokensRemoveExtendedParam,
    opts?: { nonce?: ArrayBuffer },
  ) => void
}
