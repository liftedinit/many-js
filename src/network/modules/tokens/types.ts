import { Address } from "../../../identity"
import { Memo, NetworkModule } from "../types"

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

export interface TokenBasicInfo {
  address: Address
  summary: TokenInfoSummary
  supply: TokenInfoSupply
  owner?: Address
}

export type TokenExtendedInfo = Map<AttrIndex, any>

export interface TokenInfo {
  info: TokenBasicInfo
  extended?: TokenExtendedInfo
}

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
  memo?: Memo
}

export interface TokensAddExtendedParam {
  address: Address
  extended: TokenExtendedInfo
}

export interface TokensRemoveExtendedParam {
  address: Address
  indices: AttrIndex[]
}

export interface TokensAddressMap {
  [address: string]: bigint
}

export interface TokensMintBurnParam {
  symbol: string
  addresses: TokensAddressMap
}

export interface TokensModule extends NetworkModule {
  info: (data: TokensInfoParam) => Promise<TokenInfo>
  create: (
    data: TokensCreateParam,
    opts?: { nonce?: ArrayBuffer },
  ) => Promise<TokenBasicInfo>
  update: (data: TokensUpdateParam, opts?: { nonce?: ArrayBuffer }) => void
  addExtendedInfo: (
    data: TokensAddExtendedParam,
    opts?: { nonce?: ArrayBuffer },
  ) => void
  removeExtendedInfo: (
    data: TokensRemoveExtendedParam,
    opts?: { nonce?: ArrayBuffer },
  ) => void
  mint: (
    data: TokensMintBurnParam,
    opts?: { nonce?: ArrayBuffer },
  ) => Promise<void>
  burn: (
    data: TokensMintBurnParam,
    opts?: { nonce?: ArrayBuffer },
  ) => Promise<TokensAddressMap>
}
