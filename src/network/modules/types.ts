export type NetworkModule = {
  _namespace_: string
  [k: string]: any
}

export type TransactionTypeIndices = [number, number | [number, number]]

export interface IAccount extends NetworkModule {
  info: (accountId: string) => Promise<unknown>
}

export enum AccountFeatureTypes {
  accountLedger = 0,
  accountMultisig = 1,
}

export enum AccountMultisigArgument {
  threshold = 0,
  timeout_in_secs = 1,
  execute_automatically = 2,
}

export enum AccountRole {
  owner,
  canMultisigApprove,
  canMultisigSubmit,
}

export enum AccountInfoPayloadResponseLabels {
  name = 0,
  roles = 1,
  features = 2,
}

export type AccountFeature = number | [number, unknown]