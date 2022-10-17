import cbor from "cbor"
import { tag } from "../../../../message/cbor"
import {
  Address1,
  identityStr1,
  identityStr2,
  makeMockResponseMessage,
} from "../../test/test-utils"

export const mockInfoReturnsMessage = makeMockResponseMessage(
  new Map()
    .set(0, new Map().set(0, new ArrayBuffer(32)).set(1, 12345))
    .set(1, new ArrayBuffer(32)),
)

export const mockBlockReturnsMessage = ({ timestamp }: { timestamp: number }) =>
  makeMockResponseMessage(
    new Map().set(
      0,
      makeBlock({
        parentHeight: 12344,
        height: 12345,
        timestamp,
        txns: [
          makeTxn({
            txnHash: new ArrayBuffer(32),
            request: new Map()
              .set(1, identityStr1)
              .set(2, identityStr2)
              .set(3, "endpoint.test")
              .set(4, cbor.encode(new Map().set(0, "testing")))
              .set(5, tag(1, new Date().getTime())),
            response: new Map()
              .set(1, Address1)
              .set(4, cbor.encode(new Map().set(0, "testing response")))
              .set(5, tag(1, new Date().getTime())),
          }),
        ],
      }),
    ),
  )

export const mockBlockListReturnsMessage = ({
  height,
  blocks,
}: {
  height: number
  blocks: any
}) => makeMockResponseMessage(new Map().set(0, height).set(1, blocks))

export function makeTxn({
  txnHash,
  request,
  response,
}: {
  txnHash: ArrayBuffer
  request?: any
  response?: any
}) {
  const txn = new Map()
  const txnIdentifier = new Map().set(0, txnHash)
  txn.set(0, txnIdentifier)

  if (request)
    txn.set(1, cbor.encode([null, null, cbor.encode(tag(10001, request))]))
  if (response)
    txn.set(2, cbor.encode([null, null, cbor.encode(tag(10002, response))]))

  return txn
}

export function makeBlock({
  height,
  parentHeight,
  timestamp,
  txns,
}: {
  height: number
  parentHeight: number
  timestamp: number
  txns: unknown[]
}) {
  return new Map()
    .set(0, new Map().set(0, new ArrayBuffer(32)).set(1, height))
    .set(1, new Map().set(0, new ArrayBuffer(32)).set(1, parentHeight))
    .set(2, new ArrayBuffer(32))
    .set(3, tag(1, timestamp))
    .set(4, txns.length)
    .set(5, txns)
}

export const mockTransactionReturnsMessage = (
  txn: ReturnType<typeof makeTxn>,
) => makeMockResponseMessage(new Map().set(0, txn))

export const mockRequestReturnsMessage = makeMockResponseMessage(
  new Map().set(
    0,
    cbor.encode([
      null,
      null,
      cbor.encode(
        tag(
          10001,
          new Map()
            .set(1, identityStr1)
            .set(3, "method.name")
            .set(4, cbor.encode(new Map().set(0, "test")))
            .set(5, tag(1, 1665888)),
        ),
      ),
    ]),
  ),
)

export const mockResponsetReturnsMessage = makeMockResponseMessage(
  new Map().set(
    0,
    cbor.encode([
      null,
      null,
      cbor.encode(
        tag(
          10002,
          new Map()
            .set(1, identityStr1)
            .set(4, cbor.encode(new Map().set(0, "test")))
            .set(5, tag(1, 1665777)),
        ),
      ),
    ]),
  ),
)
