import { Async } from "../async"
import { Message } from "../../../../message"
import { tag } from "../../../../message/cbor"
import cbor from "cbor"
import { Network } from "../../.."
import { AnonymousIdentity } from "../../../../identity"

describe("Async", () => {
  it("handleAsyncToken()", async () => {
    let count = 2
    const mockCall = jest
      .fn()
      .mockImplementationOnce(async () => {
        return new Message(new Map([[4, cbor.encode(new Map([[0, 0]]))]]))
      })
      .mockImplementationOnce(async () => {
        return new Message(
          new Map([
            [
              4,
              cbor.encode(
                //@ts-ignore
                new Map([
                  [0, 3],
                  [
                    1,
                    cbor.encode(
                      tag(
                        10002,
                        new Map([
                          [
                            4,
                            cbor.encode(new Map([[0, ["data", "returned"]]])),
                          ],
                        ]),
                      ),
                    ),
                  ],
                ]),
              ),
            ],
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
    const content = cbor.decode(res.content.get(4))
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
