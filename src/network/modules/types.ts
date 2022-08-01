export type NetworkModule = {
  _namespace_: string
  [k: string]: any
}

export type LedgerSendParam = {
  from?: string
  to: string
  amount: bigint
  symbol: string
}

export type EventTypeIndices = [number, number | [number, number]]

export enum EventType {
  send = "send",
  accountCreate = "accountCreate",
  accountSetDescription = "accountSetDescription",
  accountDisable = "accountDisable",
  accountAddFeatures = "accountAddFeatures",
  accountAddRoles = "accountAddRoles",
  accountRemoveRoles = "accountRemoveRoles",
  accountMultisigSubmit = "accountMultisigSubmit",
  accountMultisigApprove = "accountMultisigApprove",
  accountMultisigRevoke = "accountMultisigRevoke",
  accountMultisigExecute = "accountMultisigExecute",
  accountMultisigWithdraw = "accountMultisigWithdraw",
  accountMultisigSetDefaults = "accountMultisigSetDefaults",
  accountMultisigExpired = "accountMultisigExpired",
}

export enum AccountFeatureTypes {
  /**
   * adds canLedgerTransact account role
   */
  accountLedger = 0,
  /**
   * adds canMultisigSubmit and canMultisigApprove roles
   */
  accountMultisig = 1,
}

export enum AccountMultisigArgument {
  threshold = 0,
  expireInSecs = 1,
  executeAutomatically = 2,
}

export enum AccountRole {
  owner,
  canLedgerTransact,
  canMultisigApprove,
  canMultisigSubmit,
}

export enum AccountInfoPayloadResponseLabels {
  name = 0,
  roles = 1,
  features = 2,
}

export type AccountFeature = number | [number, unknown]

export type MakeTxnDataOpts = {
  isTxnParamData: boolean
}

export enum NetworkAttributes {
  base = 0,
  blockchain = 1,
  ledger = 2,
  kvstore = 3,
  events = 4,
  ledgerCommands = 6,
  kvstoreCommands = 7,
  async = 8,
  account = 9,
  idstore = 1002,
}

export enum MultisigTransactionState {
  pending,
  executedAutomatically,
  executedManually,
  withdrawn,
  expired,
}
