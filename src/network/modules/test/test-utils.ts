import cbor from "cbor"
import { Message } from "../../../message"

export function setupModule<M>(module: M, callImpl?: jest.Mock) {
  const mockCall = callImpl ?? jest.fn()
  return {
    call: mockCall,
    ...module,
  }
}

export function makeMockResponseMessage(responseData: unknown) {
  const content = new Map([[4, cbor.encode(responseData)]])

  return new Message(content)
}
