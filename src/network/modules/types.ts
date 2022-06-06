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

export type TransactionTypeIndices = [number, number | [number, number]]

export enum LedgerTransactionType {
  send = "send",
  accountCreate = "accountCreate",
  accountDelete = "accountDelete",
  accountAddFeature = "accountAddFeature",
  accountAddRoles = "accountAddRoles",
  accountRemoveRoles = "accountRemoveRoles",
  accountMultisigSubmit = "accountMultisigSubmit",
  accountMultisigApprove = "accountMultisigApprove",
  accountMultisigRevoke = "accountMultisigRevoke",
  accountMultisigExecute = "accountMultisigExecute",
  accountMultisigWithdraw = "accountMultisigWithdraw",
  accountMultisigSetDefaults = "accountMultisigSetDefaults",
}

export interface IAccount extends NetworkModule {
  info: (accountId: string) => Promise<unknown>
  multisigSubmitTxn: (
    txnType: LedgerTransactionType,
    opts: LedgerSendParam,
  ) => Promise<unknown>
  create: () => Promise<unknown>
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
  timeout_in_secs = 1,
  execute_automatically = 2,
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