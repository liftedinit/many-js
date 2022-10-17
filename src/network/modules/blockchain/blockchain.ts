import cbor from "cbor"
import { Message } from "../../../message"
import { CborMap } from "../../../message/cbor"
import { decoders } from "../../../message/cose"
import { arrayBufferToHex, makeRange } from "../../../utils"
import { ListOrderType, NetworkModule, RangeBounds } from "../types"

export type BlockIdentifier = {
  hash: ArrayBuffer
  height: number
}

export type TransactionIdentifier = ArrayBuffer

export type Transaction = {
  id: ArrayBuffer
  request?: {
    from?: string
    to?: string
    method: string
    timestamp: string
    cbor: string
  }
  response?: {
    from: string
    to?: string
    timestamp: Date
    cbor: string
  }
}

export type TransactionReturns = {
  txn?: Transaction
}

export enum SingleBlockQueryType {
  hash = "hash",
  height = "height",
}

export enum RangeBlockQueryType {
  height = "height",
  time = "time",
}

export type SingleBlockQueryValueType = ArrayBuffer | Number

export type Block = {
  id: BlockIdentifier
  parent?: BlockIdentifier
  appHash: ArrayBuffer
  timestamp: number
  txnCount: number
  txns: Transaction[]
}

export type InfoReturns = {
  info?: {
    latestBlock: BlockIdentifier
    appHash?: ArrayBuffer
    retainedHeight?: number
  }
}

export type BlockReturns = {
  block?: Block
}

export type BlockListReturns = {
  latestHeight: number
  blocks: BlockReturns[]
}

interface Blockchain extends NetworkModule {
  info: () => Promise<InfoReturns>
  block: (
    queryType: SingleBlockQueryType,
    value: SingleBlockQueryValueType,
  ) => Promise<BlockReturns>
  list(opts: {
    queryType: RangeBlockQueryType
    count?: number
    order?: ListOrderType
    range?: RangeBounds<number> | RangeBounds<Date>
  }): Promise<BlockListReturns>
  transaction: (txnHash: ArrayBuffer) => Promise<TransactionReturns>
  request: (txnHash: ArrayBuffer) => Promise<unknown>
  response: (txnHash: ArrayBuffer) => Promise<unknown>
}

export const Blockchain: Blockchain = {
  _namespace_: "blockchain",

  async info(): Promise<InfoReturns> {
    const msg = await this.call("blockchain.info")
    return await getBlockainInfo(msg)
  },

  async block(
    queryType: SingleBlockQueryType,
    value: SingleBlockQueryValueType,
  ): Promise<BlockReturns> {
    const m = new Map()
    if (queryType === "hash" && value instanceof ArrayBuffer) {
      m.set(0, value)
    } else if (queryType === "height" && typeof value === "number") {
      m.set(1, value)
    }
    const msg = (await this.call(
      "blockchain.block",
      new Map().set(0, m),
    )) as Message
    const payload = msg.getPayload()
    const blockData = payload.get(0)
    return await getBlock(blockData, this.blockchain)
  },

  async list({
    queryType,
    count = 10,
    order = ListOrderType.descending,
    range = [],
  }: {
    queryType: RangeBlockQueryType
    count?: number
    order?: ListOrderType
    range?: RangeBounds<number> | RangeBounds<Date>
  }): Promise<BlockListReturns> {
    const m = new Map().set(0, count).set(1, order)
    if (
      queryType === RangeBlockQueryType.height ||
      queryType === RangeBlockQueryType.time
    ) {
      const rangeBlockQuery = new Map()

      const rangeBlockQueryKey =
        queryType === RangeBlockQueryType.height ? 1 : 2

      rangeBlockQuery.set(rangeBlockQueryKey, makeRange<number | Date>(range))

      m.set(2, rangeBlockQuery)
    }
    const msg = await this.call("blockchain.list", m)
    const payload = msg.getPayload()
    const latestHeight = payload?.get(0)
    let blocks = payload?.get(1) ?? []
    const blocksData = await Promise.all(
      blocks.map(async (block: CborMap) => {
        return getBlock(block, this.blockchain)
      }),
    )

    return {
      latestHeight,
      blocks: blocksData,
    }
  },

  async transaction(txnHash: ArrayBuffer): Promise<TransactionReturns> {
    const m = new Map().set(0, txnHash)
    const msg = (await this.call(
      "blockchain.transaction",
      new Map().set(0, m),
    )) as Message
    const payload = msg.getPayload()
    const result: TransactionReturns = {
      txn: undefined,
    }
    const txnData = payload.has(0) ? payload.get(0) : null
    result.txn = txnData ? await getTxn(txnData, this.blockchain) : undefined
    return result
  },

  async request(txnHash: ArrayBuffer) {
    return (await this.call(
      "blockchain.request",
      new Map().set(0, new Map().set(0, txnHash)),
    )) as Message
  },

  async response(txnHash: ArrayBuffer) {
    return (await this.call(
      "blockchain.response",
      new Map().set(0, new Map().set(0, txnHash)),
    )) as Message
  },
}

async function getBlockainInfo(msg: Message): Promise<InfoReturns> {
  const data = msg.getPayload()
  const result: InfoReturns = {
    info: undefined,
  }
  if (data instanceof Map) {
    const latestBlock = data.get(0)
    if (latestBlock instanceof Map) {
      result.info = {
        latestBlock: {
          hash: latestBlock.get(0),
          height: latestBlock.get(1),
        },
      }
    }
    if (data?.get(1)) result.info!.appHash = data.get(1)
    if (data?.get(2)) result.info!.retainedHeight = data.get(2)
  }
  return result
}

async function getBlock(
  blockData: CborMap,
  blockchain: Blockchain,
): Promise<BlockReturns> {
  const result: BlockReturns = {
    block: undefined,
  }
  const txns = await Promise.all(
    blockData.get(5).map(async (txnMap: CborMap): Promise<Transaction> => {
      return getTxn(txnMap, blockchain)
    }),
  )

  const blockIdentifier = blockData.get(0)
  const blockHash = blockIdentifier.get(0)
  const blockHeight = blockIdentifier.get(1)

  const parent = blockData.get(1)
  const parentHash = parent.get(0)
  const parentHeight = parent.get(1)

  result.block = {
    appHash: blockData.get(2),
    timestamp: blockData.get(3)?.value,
    txnCount: blockData.get(4),
    txns,
    id: {
      hash: blockHash,
      height: blockHeight,
    },
    parent: {
      hash: parentHash,
      height: parentHeight,
    },
  }
  return result
}

async function getTxn(
  txnMap: CborMap,
  blockchain: Blockchain,
): Promise<Transaction> {
  const hasManyRequestCbor = txnMap.has(1)
  const manyRequestCbor = { value: txnMap.get(1) }
  const hasManyResponseCbor = txnMap.has(2)
  const manyResponseCbor = { value: txnMap.get(2) }
  const txnHash = (txnMap?.get?.(0) as Map<number, ArrayBuffer>)?.get(0)!

  let request
  let response

  await getRequestOrResponseContent(
    hasManyRequestCbor,
    manyRequestCbor,
    async () => await blockchain.request(txnHash),
    c => {
      const from = c?.get(1)?.toString()
      const to = c?.get(2)?.toString()
      const method = c?.get(3)
      const timestamp = c?.get(5)?.value
      const manyRequestCborHex = arrayBufferToHex(
        manyRequestCbor.value as ArrayBuffer,
      )
      request = {
        from,
        to,
        method,
        timestamp,
        cbor: manyRequestCborHex,
      }
    },
  )

  await getRequestOrResponseContent(
    hasManyResponseCbor,
    manyResponseCbor,
    async () => await blockchain.response(txnHash),
    c => {
      const from = c?.get(1)?.toString()
      const to = c?.get(2)?.toString()
      const timestamp = c?.get(5)?.value
      const manyResponseCborHex = arrayBufferToHex(
        manyResponseCbor.value as ArrayBuffer,
      )
      response = {
        from,
        to,
        timestamp,
        cbor: manyResponseCborHex,
      }
    },
  )

  return {
    id: txnHash,
    request,
    response,
  }
}

async function getRequestOrResponseContent(
  hasRequestOrResponseCbor: boolean,
  manyRequestOrResponseCbor: { value: ArrayBuffer },
  blockchainRequestOrResponseCall: () => Promise<unknown>,
  onContentLoaded: (content: CborMap) => void,
) {
  let blockchainRequestOrResponseRes
  let blockchainRequestOrResponsePayload
  if (!hasRequestOrResponseCbor) {
    try {
      blockchainRequestOrResponseRes =
        (await blockchainRequestOrResponseCall()) as Message
      blockchainRequestOrResponsePayload =
        blockchainRequestOrResponseRes.getPayload()
      manyRequestOrResponseCbor.value =
        blockchainRequestOrResponsePayload.get(0)
    } catch (e) {
      console.error("blockchainRequestOrResponseCall error", e)
    }
  }
  let manyRequestOrResponse
  try {
    if (manyRequestOrResponseCbor.value) {
      manyRequestOrResponse = cbor.decodeFirstSync(
        manyRequestOrResponseCbor.value as ArrayBuffer,
        decoders,
      )
    }
  } catch (e) {
    console.error("error decoding request or response cbor", e)
  }
  if (manyRequestOrResponse) {
    const requestOrResponseContentCbor = manyRequestOrResponse?.[2]
    try {
      const requestOrResponseContentDecoded = requestOrResponseContentCbor
        ? cbor.decodeFirstSync(
            requestOrResponseContentCbor as ArrayBuffer,
            decoders,
          )?.value
        : null
      onContentLoaded(requestOrResponseContentDecoded)
    } catch (e) {
      console.error("error decoding request or response content", e)
    }
  }
}
