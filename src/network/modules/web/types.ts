import { NetworkModule } from "../types"
import { Address } from "../../../identity"
import { SortOrder } from "../kvStore/types"

export interface WebInfo {
  hash: string
}

type Archive = [0, {0: string}];

export enum DeploymentTypes {
  Archive = "Archive"
}

export type DeploymentSource =
  | { type: DeploymentTypes.Archive; payload: Archive };

type OwnerFilter = [0, {0: Address}];

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
  memo?: string
}

export interface WebDeployInfo {
  owner: Address,
  siteName: string,
  siteDescription: string,
  deploymentUrl: string,
}

export interface WebRemoveParam {
  owner?: Address,
  siteName: string,
  memo?: string,
}

export interface WebListParam {
  order?: SortOrder,
  filter?: WebDeploymentFilter,
}

export interface WebDeployInfoList {
  list: WebDeployInfo[],
}

export interface WebModule extends NetworkModule {
  info: () => Promise<WebInfo>
  list: (data: WebListParam) => Promise<WebDeployInfoList>
  deploy: (data: WebDeployParams, opts?: { nonce?: ArrayBuffer }) => Promise<WebDeployInfo>
  remove: (data: WebRemoveParam, opts?: { nonce?: ArrayBuffer }) => void
}
