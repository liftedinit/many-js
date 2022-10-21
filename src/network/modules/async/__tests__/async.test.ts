import { Async } from "../async"
import { Message } from "../../../../message"
import { tag } from "../../../../message/cbor"
import cbor from "cbor"
import { Network } from "../../.."
import { AnonymousIdentity } from "../../../../identity"
import { AsyncStatusResult } from ".."

describe("Async", () => {
  it("handleAsyncToken()", async () => {
    const mockCall = jest
      .fn()
      .mockImplementationOnce(async () => {
        return makeAsyncStatusPollResponseMessage(AsyncStatusResult.Unknown)
      })
      .mockImplementationOnce(async () => {
        return makeAsyncStatusPollResponseMessage(
          AsyncStatusResult.Done,
          // create the CoseSign1 structure that represents the payload
          cbor.encode([
            null,
            null,
            cbor.encode(
              tag(
                10002,
                new Map([
                  [4, cbor.encode(new Map([[0, ["data", "returned"]]]))],
                ]),
              ),
            ),
          ]),
        )
      })
    const async = setupAsync(mockCall)
    const n = new Network("/api", new AnonymousIdentity())
    n.call = mockCall
    const res = (await async.handleAsyncToken(
      new Message(new Map([[8, [[1, new ArrayBuffer(0)]]]])),
      n,
    )) as Message
    const content = res.getPayload()
    expect(content instanceof Map).toBe(true)
    expect(content.get(0)).toEqual(["data", "returned"])
  })
})

function setupAsync(callImpl?: jest.Mock) {
  const mockCall = callImpl ?? jest.fn()
  return {
    call: mockCall,
    ...Async,
  }
}

function makeAsyncStatusPollResponseMessage(
  statusResult: AsyncStatusResult,
  payload?: ArrayBuffer,
) {
  const result = new Map()
  result.set(0, statusResult)
  if (payload) result.set(1, payload)
  return new Message(new Map([[4, cbor.encode(result)]]))
}
