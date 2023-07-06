import { NetworkModule } from "../types"

export enum ByteUnit {
  K = 0,
  Ki = 1,
  M = 2,
  Mi = 3,
  G = 4,
  Gi = 5,
  T = 6,
  Ti = 7,
  P = 8,
  Pi = 9,
  E = 10,
  Ei = 11,
}

export enum Region {
  UsEast = 0,
  UsWest = 1,
}

export enum ComputeStatus {
  Deployed = 0,
  Closed = 1
}

export enum ServiceProtocol {
    TCP = 0,
    UDP = 1,
}

export interface ComputeInfo {
  hash: string
}

export interface ComputeDeployParam {
  image: string,
  port: number,
  num_cpu: number,
  num_memory: number,
  memory_type: ByteUnit,
  num_storage: number,
  storage_type: ByteUnit,
  region: Region,
}

export interface ComputeCloseParam {
  dseq: number
}

export interface ComputeListParam {
  owner? : string | null,
}

export interface ProviderInfo {
  host?: string,
  port: number,
  external_port: number,
  protocol: ServiceProtocol,
}

export interface DeploymentInfo {
  provider: string,
  provider_info: ProviderInfo,
}

export interface DeploymentMeta {
  status: ComputeStatus,
  dseq: number,
  meta?: DeploymentInfo,
}

export interface DeploymentList {
  deployments: DeploymentMeta[]
}

export interface ComputeModule extends NetworkModule {
  info: () => Promise<ComputeInfo>
  deploy: (
    data: ComputeDeployParam,
    opts?: { nonce?: ArrayBuffer },
  ) => void
  close: (
    data: ComputeCloseParam,
    opts?: { nonce?: ArrayBuffer },
  ) => void
  list: (
    data: ComputeListParam,
  ) => Promise<DeploymentList>
}
