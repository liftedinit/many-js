import { Address } from "../../../identity"
import { NetworkModule } from "../types"

export interface KVStoreInfo {
  hash: string
}

export interface KVStoreValue {
  value?: any
}

export interface KVStoreQuery {
  owner: Address
  enabled: boolean | string
}

export interface KVStoreGetParam {
  key: string
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
  get: (data: KVStoreGetParam) => Promise<KVStoreValue>
  put: (data: KVStorePutParam, opts?: { nonce?: ArrayBuffer }) => void
  query: (data: KVStoreGetParam) => Promise<KVStoreQuery>
  disable: (data: KVStoreDisableParam, opts?: { nonce?: ArrayBuffer }) => void
  transfer: (data: KVStoreTransferParam, opts?: { nonce?: ArrayBuffer }) => void
}
