import { Memo, NetworkModule, SortOrder } from "../types"
import { Address } from "../../../identity"

export interface WebInfo {
  hash: string
}

export type Archive = [0, Map<number, ArrayBuffer>];

export enum DeploymentTypes {
  Archive = "Archive"
}

export type DeploymentSource =
  | { type: DeploymentTypes.Archive; payload: Archive };

export type OwnerFilter = [0, Map<number, Address | string>];

export enum FilterTypes {
  Owner = "OwnerFilter"
}

export type WebDeploymentFilter =
  | { type: FilterTypes.Owner; payload: OwnerFilter };

export interface WebDeployParams {
  owner?: Address,
  siteName: string,
  siteDescription?: string,
  deploymentSource: DeploymentSource,
  memo?: Memo
}

export interface WebDeployInfo {
  owner: Address,
  siteName: string,
  siteDescription?: string,
  deploymentUrl: string,
}

export interface WebRemoveParam {
  owner?: Address,
  siteName: string,
  memo?: Memo,
}

export interface WebListParam {
  count?: number,
  order?: SortOrder,
  filters?: WebDeploymentFilter[],
}

export interface WebModule extends NetworkModule {
  info: () => Promise<WebInfo>
  list: (data: WebListParam) => Promise<WebDeployInfo[]>
  deploy: (data: WebDeployParams, opts?: { nonce?: ArrayBuffer }) => Promise<WebDeployInfo>
  remove: (data: WebRemoveParam, opts?: { nonce?: ArrayBuffer }) => void
}
