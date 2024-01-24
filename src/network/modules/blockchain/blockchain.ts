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

export interface BlockchainTransaction {
  transactionIdentifier: TransactionIdentifier,
  transactionRequest?: ArrayBuffer,
  transactionResponse?: ArrayBuffer,
  [key: string]: any,
}

export interface BlockchainBlock {
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
  request: (params: SingleTransactionQuery) => Promise<ArrayBuffer>
  response: (params: SingleTransactionQuery) => Promise<ArrayBuffer>
}

export const Blockchain: Blockchain = {
  _namespace_: "blockchain",

  // Tested to work
  async info(): Promise<BlockchainInfo> {
    const message = await this.call("blockchain.info")
    const payload = message.getPayload()
    return getBlockchainInfo(payload)
  },

  // Tested to work
  async block(params: SingleBlockQuery): Promise<BlockchainBlock> {
    const cborParams = makeBlockParam(params)
    const message = await this.call("blockchain.block", cborParams)
    const payload = message.getPayload()
    return getBlockchainBlock(payload)
  },

  // Untested
  async transaction(params: SingleTransactionQuery): Promise<BlockchainTransaction> {
    const cborParams = makeTransactionParam(params)
    const message = await this.call("blockchain.transaction", cborParams)
    const payload = message.getPayload()
    return getBlockchainTransaction(payload)
  },

  async request(_params: SingleTransactionQuery): Promise<ArrayBuffer> {
    throw new Error("Not implemented")
  },

  async response(_params: SingleTransactionQuery): Promise<ArrayBuffer> {
    throw new Error("Not implemented")
  }
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

function getBlockchainBlock(data: Map<number, any>): BlockchainBlock {
  return {
    blockIdentifier: {
      hash: data.get(0)?.get(0)?.get(0),
      height: data.get(0)?.get(0)?.get(1),
    },
    parentBlockIdentifier: {
      hash: data.get(0)?.get(1)?.get(0),
      height: data.get(0)?.get(1)?.get(1),
    },
    appHash: data.get(0)?.get(2),
    timestamp: data.get(0)?.get(3),
    totalTxs: data.get(0)?.get(4),
    transactions: data.get(0)?.get(5).map((tx: Map<number, any>) => {
      return {
        transactionIdentifier: {
          hash: tx.get(0)?.get(0),
        },
        transactionRequest: tx.get(1),
        transactionResponse: tx.get(2),
      }
    })
  }
}

function getBlockchainTransaction(data: Map<number, any>): BlockchainTransaction {
  return {
    transactionIdentifier: {
      hash: data.get(0)?.get(0),
    },
    transactionRequest: data.get(1),
    transactionResponse: data.get(2),
  }
}

function makeBlockParam(params: SingleBlockQuery) {
  const query = new Map<number, any>()
  if (params.hash) {
    query.set(0, params.hash)
  } else if (params.height) {
    query.set(1, params.height)
  }
  return new Map([[0, query]])
}

function makeTransactionParam(params: SingleTransactionQuery) {
  const query = new Map<number, any>()
  if (params.hash) {
    query.set(0, params.hash)
  } else if (params.blockTxIdx) {
    query.set(1, [makeBlockParam(params.blockTxIdx[0]), params.blockTxIdx[1]])
  }
  return new Map([[0, query]])
}
