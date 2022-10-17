import cbor from "cbor"
import { Message } from "../../../../message"
import { tag } from "../../../../message/cbor"
import { decoders } from "../../../../message/cose"
import {
  Address1,
  identityStr1,
  identityStr2,
  identityStr3,
} from "../../test/test-utils"
import { BoundType, ListOrderType, RangeBounds } from "../../types"
import {
  Blockchain,
  SingleBlockQueryType,
  RangeBlockQueryType,
  Transaction,
  Block,
} from "../blockchain"
import {
  makeBlock,
  makeTxn,
  mockBlockListReturnsMessage,
  mockBlockReturnsMessage,
  mockInfoReturnsMessage,
  mockRequestReturnsMessage,
  mockResponsetReturnsMessage,
  mockTransactionReturnsMessage,
} from "./data"

describe("Blockchain", () => {
  describe("info()", () => {
    it("return count and supported events", async () => {
      const mockCall = jest.fn(async () => {
        return mockInfoReturnsMessage
      })
      const blockchain = setupBlockchain(mockCall)
      const res = await blockchain.info()
      expect(mockCall).toHaveBeenCalledTimes(1)
      expect(mockCall).toHaveBeenCalledWith("blockchain.info")
      expect(res).toEqual({
        info: {
          latestBlock: {
            hash: Buffer.from(new ArrayBuffer(32)),
            height: 12345,
          },
          appHash: Buffer.from(new ArrayBuffer(32)),
        },
      })
    })
  })

  describe("block()", () => {
    it("returns data for one block", async () => {
      const blockTimestamp = new Date().getTime()
      const mockCall = jest.fn(async () =>
        mockBlockReturnsMessage({ timestamp: blockTimestamp }),
      )
      const blockHeightTarget = 12345
      const blockchain = setupBlockchain(mockCall)
      const res = await blockchain.block(
        SingleBlockQueryType.height,
        blockHeightTarget,
      )

      expect(mockCall).toHaveBeenCalledWith(
        "blockchain.block",
        new Map().set(0, new Map().set(1, blockHeightTarget)),
      )

      expect(res.block?.timestamp).toBe(blockTimestamp)
      expect(res.block?.id).toEqual({
        hash: Buffer.from(new ArrayBuffer(32)),
        height: 12345,
      })
      expect(res.block?.parent).toEqual({
        hash: Buffer.from(new ArrayBuffer(32)),
        height: 12344,
      })
      expect(res.block?.appHash).toEqual(Buffer.from(new ArrayBuffer(32)))
      expect(res.block?.txnCount).toBe(1)
      res.block?.txns.forEach(txn => {
        validateTxn(txn)
      })
    })
  })

  describe("transaction()", () => {
    it("provides data for one transaction", async () => {
      const mockCall = jest.fn(async () =>
        mockTransactionReturnsMessage(
          makeTxn({
            txnHash: new ArrayBuffer(32),
            request: new Map()
              .set(1, identityStr1)
              .set(2, identityStr2)
              .set(3, "endpoint.test")
              .set(4, cbor.encode(new Map()))
              .set(5, tag(1, new Date().getTime())),
            response: new Map()
              .set(1, Address1)
              .set(4, cbor.encode(new Map()))
              .set(5, tag(1, new Date().getTime())),
          }),
        ),
      )
      const blockchain = setupBlockchain(mockCall)
      const res = await blockchain.transaction(new ArrayBuffer(32))

      expect(mockCall).toHaveBeenCalledWith(
        "blockchain.transaction",
        new Map().set(0, new Map().set(0, new ArrayBuffer(32))),
      )
      validateTxn(res.txn!)
    })
  })

  describe("list()", () => {
    it("returns data for a list of blocks", async () => {
      const block1Timestamp = new Date().getTime()
      const block2Timestamp = block1Timestamp - 10000
      const block3Timestamp = block2Timestamp - 10000
      const currentHeight = 10
      const lowerHeight = 8
      const blocks = [
        makeBlock({
          height: 10,
          parentHeight: 9,
          timestamp: block1Timestamp,
          txns: [
            makeTxn({
              txnHash: new ArrayBuffer(32),
              request: new Map()
                .set(1, identityStr1)
                .set(2, identityStr2)
                .set(3, "endpoint.test")
                .set(4, cbor.encode(new Map()))
                .set(5, tag(1, new Date().getTime())),
              response: new Map()
                .set(1, Address1)
                .set(4, cbor.encode(new Map()))
                .set(5, tag(1, new Date().getTime())),
            }),
          ],
        }),
        makeBlock({
          height: 9,
          parentHeight: 8,
          timestamp: block2Timestamp,
          txns: [
            makeTxn({
              txnHash: new ArrayBuffer(32),
              request: new Map()
                .set(1, identityStr2)
                .set(2, identityStr1)
                .set(3, "endpoint.test")
                .set(4, cbor.encode(new Map()))
                .set(5, tag(1, new Date().getTime())),
              response: new Map()
                .set(1, Address1)
                .set(4, cbor.encode(new Map()))
                .set(5, tag(1, new Date().getTime())),
            }),
          ],
        }),
        makeBlock({
          height: 8,
          parentHeight: 7,
          timestamp: block3Timestamp,
          txns: [
            makeTxn({
              txnHash: new ArrayBuffer(32),
              request: new Map()
                .set(1, identityStr1)
                .set(2, identityStr3)
                .set(3, "endpoint.test")
                .set(4, cbor.encode(new Map()))
                .set(5, tag(1, new Date().getTime())),
              response: new Map()
                .set(1, Address1)
                .set(4, cbor.encode(new Map()))
                .set(5, tag(1, new Date().getTime())),
            }),
          ],
        }),
      ]
      const mockCall = jest.fn(async () =>
        mockBlockListReturnsMessage({ blocks, height: currentHeight }),
      )
      const blockchain = setupBlockchain(mockCall)
      const count = blocks.length
      const order = ListOrderType.ascending
      const range: RangeBounds<number> = [
        { boundType: BoundType.inclusive, value: lowerHeight },
        { boundType: BoundType.inclusive, value: currentHeight },
      ]
      const res = await blockchain.list({
        queryType: RangeBlockQueryType.height,
        count,
        order,
        range,
      })

      expect(mockCall).toHaveBeenCalledWith(
        "blockchain.list",
        new Map()
          .set(0, count)
          .set(1, order)
          .set(
            2,
            new Map().set(
              1,
              new Map().set(0, [0, lowerHeight]).set(1, [0, currentHeight]),
            ),
          ),
      )
      expect(res.blocks).toBeDefined()

      expect(res.blocks.length).toBe(3)
      expect(res.latestHeight).toBe(10)
      res.blocks.forEach(b => {
        const { block } = b
        validateBlock(block!)
      })
    })
  })

  describe("request()", () => {
    it("returns request data for a transaction", async () => {
      const mockCall = jest.fn(async () => mockRequestReturnsMessage)

      const blockchain = setupBlockchain(mockCall)

      const txnHash = new ArrayBuffer(32)
      const res = (await blockchain.request(txnHash)) as Message
      const returnedManyRequest = cbor.decode(
        res?.getPayload()?.get(0),
        decoders,
      )
      const returnedManyRequestData = cbor.decode(
        returnedManyRequest[2],
        decoders,
      )?.value

      expect(mockCall).toHaveBeenCalledWith(
        "blockchain.request",
        new Map().set(0, new Map().set(0, txnHash)),
      )
      expect(returnedManyRequestData?.get(1)).toBe(identityStr1)
      expect(returnedManyRequestData?.get(3)).toBe("method.name")
      const argument = cbor.decode(returnedManyRequestData?.get(4), decoders)
      expect(argument).toEqual(new Map().set(0, "test"))
      expect(returnedManyRequestData?.get(5)).toEqual(tag(1, 1665888))
    })
  })

  describe("response()", () => {
    it("returns response data for a transaction", async () => {
      const mockCall = jest.fn(async () => mockResponsetReturnsMessage)

      const blockchain = setupBlockchain(mockCall)

      const txnHash = new ArrayBuffer(32)
      const res = (await blockchain.response(txnHash)) as Message
      const returnedManyResponse = cbor.decode(
        res?.getPayload()?.get(0),
        decoders,
      )
      const returnedManyResponseData = cbor.decode(
        returnedManyResponse[2],
        decoders,
      )?.value

      expect(mockCall).toHaveBeenCalledWith(
        "blockchain.response",
        new Map().set(0, new Map().set(0, txnHash)),
      )
      expect(returnedManyResponseData?.get(1)).toBe(identityStr1)
      const argument = cbor.decode(returnedManyResponseData?.get(4), decoders)
      expect(argument).toEqual(new Map().set(0, "test"))
      expect(returnedManyResponseData?.get(5)).toEqual(tag(1, 1665777))
    })
  })
})

function setupBlockchain(callImpl?: jest.Mock) {
  const mockCall = callImpl ?? jest.fn()
  const mixedIn = {
    call: mockCall,
    ...Blockchain,
  }
  return mixedIn
}

function validateTxn(txn: Transaction) {
  expect(txn.id).toEqual(Buffer.from(new ArrayBuffer(32)))

  expect(txn.request).toBeDefined()
  expect("from" in txn.request!).toBe(true)
  expect("to" in txn.request!).toBe(true)
  expect(txn.request?.method).toBeDefined()
  expect(txn.request?.timestamp).toBeDefined()
  expect(txn.request?.cbor).toBeDefined()

  expect(txn.response).toBeDefined()
  expect(txn.response?.from).toBeDefined()
  expect("to" in txn.response!).toBe(true)
  expect("timestamp" in txn.response!).toBe(true)
  expect(txn.response?.cbor).toBeDefined()
}

function validateBlock(block: Block) {
  expect(block?.appHash).toBeDefined()
  expect(block?.timestamp).toBeDefined()

  expect(block?.id).toBeDefined()
  expect(block?.id.hash).toEqual(Buffer.from(new ArrayBuffer(32)))
  expect(block?.id.height).toBeDefined()

  expect(block?.parent).toBeDefined()
  expect(block?.parent?.hash).toBeDefined()
  expect(block?.parent?.height).toBeDefined()

  expect(block?.txnCount).toBeDefined()

  block.txns.forEach(txn => validateTxn(txn))
}
