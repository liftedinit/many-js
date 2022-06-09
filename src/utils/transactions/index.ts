import { transactionTypeIndices } from "../../const"
import { Address } from "../../identity"
import { CborMap } from "../../message/cbor"
import {
  LedgerSendParam,
  LedgerTransactionType,
  MakeTxnDataOpts,
  MultisigSubmitTransaction,
  SendTransaction,
  Transaction,
  TransactionTypeIndices,
  MultisigTransaction,
} from "../../network"

export function makeLedgerSendParam({
  from,
  to,
  symbol,
  amount,
}: LedgerSendParam) {
  const m = new Map()
  from && m.set(0, from)
  return m.set(1, to).set(2, amount).set(3, symbol)
}

export async function getTxnTypeNameFromIndices(
  indices: TransactionTypeIndices,
): Promise<LedgerTransactionType | undefined> {
  const indicesJson = JSON.stringify(indices)

  for (let k of Object.keys(transactionTypeIndices)) {
    const val = JSON.stringify(
      transactionTypeIndices[k as LedgerTransactionType],
    )
    if (indicesJson === val) {
      return k as LedgerTransactionType
    }
  }
}

export async function makeTxnData(
  txn: Map<number, unknown>,
  opts?: MakeTxnDataOpts,
): Promise<Omit<Transaction, "id" | "time"> | undefined> {
  const indices = txn.get(0) as TransactionTypeIndices
  const txnTypeName = await getTxnTypeNameFromIndices(indices)

  if (txnTypeName === LedgerTransactionType.send)
    return await makeSendTransactionData(txn, opts)
  else if (txnTypeName === LedgerTransactionType.accountMultisigSubmit)
    return await makeMultisigSubmitTxnData(txn)
  else if (txnTypeName === LedgerTransactionType.accountMultisigApprove)
    return makeMultisigTxnData(
      LedgerTransactionType.accountMultisigApprove,
      "approver",
      txn,
    )
  else if (txnTypeName === LedgerTransactionType.accountMultisigRevoke)
    return makeMultisigTxnData(
      LedgerTransactionType.accountMultisigRevoke,
      "revoker",
      txn,
    )
  else if (txnTypeName === LedgerTransactionType.accountMultisigExecute)
    return makeMultisigTxnData(
      LedgerTransactionType.accountMultisigExecute,
      "executor",
      txn,
    )
  else if (txnTypeName === LedgerTransactionType.accountMultisigWithdraw)
    return makeMultisigTxnData(
      LedgerTransactionType.accountMultisigWithdraw,
      "withdrawer",
      txn,
    )

  console.error("txn type not implemented", indices)
}

async function makeMultisigTxnData(
  type: LedgerTransactionType,
  actorType: "approver" | "revoker" | "executor" | "withdrawer",
  txnData: Map<number, unknown>,
): Promise<Omit<MultisigTransaction, "id" | "time">> {
  return {
    type,
    account: await getAddressFromTaggedIdentity(
      txnData.get(1) as { value: Uint8Array },
    ),
    token: txnData.get(2) as ArrayBuffer,
    [actorType]: await getAddressFromTaggedIdentity(
      txnData.get(3) as { value: Uint8Array },
    ),
  }
}

async function makeSendTransactionData(
  txnData: Map<number, unknown>,
  opts?: MakeTxnDataOpts,
): Promise<Omit<SendTransaction, "id" | "time">> {
  const { isTxnParamData } = opts || {}
  if (isTxnParamData) {
    txnData = txnData.get(1) as Map<number, unknown>
    return {
      type: LedgerTransactionType.send,
      from: await getAddressFromTaggedIdentity(
        txnData.get(0) as {
          value: Uint8Array
        },
      ),
      to: await getAddressFromTaggedIdentity(
        txnData.get(1) as {
          value: Uint8Array
        },
      ),
      symbolAddress: await getAddressFromTaggedIdentity(
        txnData.get(3) as {
          value: Uint8Array
        },
      ),
      amount: BigInt(txnData.get(2) as number),
    }
  }
  return {
    type: LedgerTransactionType.send,
    from: await getAddressFromTaggedIdentity(
      txnData.get(1) as {
        value: Uint8Array
      },
    ),
    to: await getAddressFromTaggedIdentity(
      txnData.get(2) as {
        value: Uint8Array
      },
    ),
    symbolAddress: await getAddressFromTaggedIdentity(
      txnData.get(3) as { value: Uint8Array },
    ),
    amount: BigInt(txnData.get(4) as number),
  }
}

export async function getAddressFromTaggedIdentity(taggedIdentity: {
  value: Uint8Array
}): Promise<string> {
  return new Address(taggedIdentity.value as Buffer).toString()
}

// https://github.com/liftedinit/many-rs/blob/main/src/many/src/types/ledger.rs#L658
async function makeMultisigSubmitTxnData(
  txnData: Map<number, unknown>,
): Promise<Omit<MultisigSubmitTransaction, "id" | "time">> {
  const submittedTxn = txnData.get(4) as Map<number, unknown>
  const transaction = await makeTxnData(submittedTxn, {
    isTxnParamData: true,
  })

  return {
    type: LedgerTransactionType.accountMultisigSubmit,
    submitter: await getAddressFromTaggedIdentity(
      txnData.get(1) as { value: Uint8Array },
    ),
    account: await getAddressFromTaggedIdentity(
      txnData.get(2) as { value: Uint8Array },
    ),
    memo: txnData.get(3) as string,
    transaction,
    token: txnData.get(5) as ArrayBuffer,
    threshold: txnData.get(6) as number,
    timeout: txnData.get(7) as Date,
    execute_automatically: txnData.get(8) as boolean,
    data: txnData.get(9) as CborMap,
  }
}
