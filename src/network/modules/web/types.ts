import { Memo, NetworkModule, SortOrder } from "../types"
import { Address } from "../../../identity"

export interface WebInfo {
  hash: string
}

export type Archive = [0, Map<number, ArrayBuffer>]

export enum DeploymentTypes {
  Archive = "Archive",
}

export type DeploymentSource = {
  type: DeploymentTypes.Archive
  payload: Archive
}

export type OwnerFilter = [0, Map<number, Address>]

export enum FilterTypes {
  Owner = "OwnerFilter",
}

export type WebDeploymentFilter = {
  type: FilterTypes.Owner
  payload: OwnerFilter
}

export interface WebDeployParams {
  owner?: Address
  siteName: string
  siteDescription?: string
  deploymentSource: DeploymentSource
  memo?: Memo
  domain?: string
}

export type WebUpdateParams = WebDeployParams

export interface WebDeployInfo {
  owner: Address
  siteName: string
  siteDescription?: string
  deploymentUrl: string
  domain?: string
}

export interface WebRemoveParams {
  owner?: Address
  siteName: string
  memo?: Memo
}

export interface WebListParams {
  count?: number
  order?: SortOrder
  filters?: WebDeploymentFilter[]
  page?: number
}

export interface WebListReturns {
  deployments: WebDeployInfo[]
  totalCount: number
}

export interface WebModule extends NetworkModule {
  info: () => Promise<WebInfo>
  list: (data: WebListParams) => Promise<WebListReturns>
  deploy: (
    data: WebDeployParams,
    opts?: { nonce?: ArrayBuffer },
  ) => Promise<WebDeployInfo>
  remove: (data: WebRemoveParams, opts?: { nonce?: ArrayBuffer }) => void
  update: (
    data: WebUpdateParams,
    opts?: { nonce?: ArrayBuffer },
  ) => Promise<WebDeployInfo>
}
