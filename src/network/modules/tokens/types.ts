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

export interface TokensCreateParam {
  summary: TokenInfoSummary
  owner?: Address
  distribution?: Map<Address, LedgerAmount>
  maximumSupply?: LedgerAmount
  extended?: Map<number, any>
}

export interface TokensUpdateParams {
  address: Address
  name?: string
  precision?: number
  owner?: Address | null
  memo: string // What's a "memo"?
}

export interface Tokens extends NetworkModule {
  // info: (data: ) => Promise<unknown>
  create: (
    data: TokensCreateParam,
    opts: { nonce?: ArrayBuffer },
  ) => Promise<unknown>
  // update: (
  //   data: TokensUpdateParams,
  //   opts: { nonce?: ArrayBuffer },
  // ) => Promise<unknown>
}
