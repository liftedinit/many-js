import { Address } from "../../../identity"
import { NetworkModule } from "../types"

type KeyFilterType =
  | [0, Address] // Owner
  | [1, Address] // Previous Owner
  | [2, boolean] // Disabled?

export enum SortOrder {
    Indeterminate = 0,
    Ascending = 1,
    Descending = 2,
}

export interface KVStoreInfo {
  hash: string
}

export interface KVStoreList {
  keys: string[]
}

export interface KVStoreValue {
  key: string
  value?: any
}

export interface KVStoreQuery {
  key: string
  owner: Address
  enabled: boolean | string
}

export interface KVStoreGetParam {
  key: string
}

export interface KVStoreListParam {
  count?: number,
  order?: SortOrder,
  filter?: KeyFilterType[],
}

export interface KVStorePutParam {
  key: string
  value: any
  owner?: string | Address
}

export interface KVStoreDisableParam {
  key: string
  owner?: string | Address
}

export interface KVStoreTransferParam {
  key: string
  owner?: string | Address
  newOwner: string | Address
}

export interface KVStoreModule extends NetworkModule {
  info: () => Promise<KVStoreInfo>
  list: (data: KVStoreListParam) => Promise<KVStoreList>
  get: (data: KVStoreGetParam) => Promise<KVStoreValue>
  put: (data: KVStorePutParam, opts?: { nonce?: ArrayBuffer }) => void
  query: (data: KVStoreGetParam) => Promise<KVStoreQuery>
  disable: (data: KVStoreDisableParam, opts?: { nonce?: ArrayBuffer }) => void
  transfer: (data: KVStoreTransferParam, opts?: { nonce?: ArrayBuffer }) => void
}
