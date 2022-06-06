import {
  LedgerTransactionType,
  TransactionTypeIndices,
} from "./network/modules/types"

export const ONE_SECOND = 1000
export const ONE_MINUTE = 60000

export const transactionTypeIndices: {
  [key in LedgerTransactionType]: TransactionTypeIndices
} = {
  [LedgerTransactionType.send]: [4, 0],
  [LedgerTransactionType.accountCreate]: [9, 0],
  [LedgerTransactionType.accountAddRoles]: [9, 2],
  [LedgerTransactionType.accountRemoveRoles]: [9, 3],
  [LedgerTransactionType.accountDelete]: [9, 4],
  [LedgerTransactionType.accountAddFeature]: [9, 5],
  [LedgerTransactionType.accountMultisigSubmit]: [9, [1, 0]],
  [LedgerTransactionType.accountMultisigApprove]: [9, [1, 1]],
  [LedgerTransactionType.accountMultisigRevoke]: [9, [1, 2]],
  [LedgerTransactionType.accountMultisigExecute]: [9, [1, 3]],
  [LedgerTransactionType.accountMultisigWithdraw]: [9, [1, 4]],
  [LedgerTransactionType.accountMultisigSetDefaults]: [9, [1, 5]],
}
