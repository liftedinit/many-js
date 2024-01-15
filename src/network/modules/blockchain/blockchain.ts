import { NetworkModule } from "../types"

interface BlockIdentifier {
  hash: ArrayBuffer,
  height: number,
}

// One or the other, not both
interface SingleBlockQuery {
  hash?: ArrayBuffer,
  height?: number,
}

// One or the other, not both
interface SingleTransactionQuery {
  hash?: ArrayBuffer,
  blockTxIdx?: [SingleBlockQuery, number],
}

interface TransactionIdentifier {
  hash: ArrayBuffer,
}

interface BlockchainTransaction {
  transactionIdentifier: TransactionIdentifier,
  transactionRequest?: ArrayBuffer,
  transactionResponse?: ArrayBuffer,
  [key: string]: any,
}

interface BlockchainBlock {
  blockIdentifier: BlockIdentifier,
  parentBlockIdentifier?: BlockIdentifier,
  appHash?: ArrayBuffer,
  timestamp?: number,
  totalTxs: number,
  transactions: BlockchainTransaction[],
  // 6 => [ * bstr ], NOT IMPLEMENTED
  [key: string]: any,
}

export interface BlockchainInfo {
  blockIdentifier: BlockIdentifier,
  serverStateHash?: ArrayBuffer,
  earliestQueryableHeight?: number,
}


interface Blockchain extends NetworkModule {
  _namespace_: string
  info: () => Promise<BlockchainInfo>
  block: (params: SingleBlockQuery) => Promise<BlockchainBlock>
  transaction: (params: SingleTransactionQuery) => Promise<BlockchainTransaction>
}

export const Blockchain: Blockchain = {
  _namespace_: "blockchain",
  async info(): Promise<BlockchainInfo> {
    const message = await this.call("blockchain.info")
    const payload = message.getPayload()
    return getBlockchainInfo(payload)
  },

  async block(params: SingleBlockQuery): Promise<BlockchainBlock> {
    return await this.call("blockchain.block", params)
  },

  async transaction(params: SingleTransactionQuery): Promise<BlockchainTransaction> {
    return await this.call("blockchain.transaction", params)
  },
}

function getBlockchainInfo(data: Map<number, any>): BlockchainInfo {
  return {
    blockIdentifier: {
      hash: data.get(0)?.get(0),
      height: data.get(0)?.get(1),
    },
    serverStateHash: data.get(1),
    earliestQueryableHeight: data.get(2),
  }
}