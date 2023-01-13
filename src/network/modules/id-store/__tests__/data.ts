import cbor from "cbor"
import { Message } from "../../../../message"

export const mockStoreResponseContent = new Map([
  [4, cbor.encode(new Map([[0, ["recovery", "phrase"]]]))],
])
export const mockStoreResponseMessage = new Message(mockStoreResponseContent)

export const mockGetCredentialResponseContent = new Map([
  [
    4,
    cbor.encode(
      // @ts-ignore
      new Map([
        [0, new ArrayBuffer(32)],
        [1, new ArrayBuffer(32)],
      ]),
    ),
  ],
])
export const mockGetCredentialResponseMessage = new Message(
  mockGetCredentialResponseContent,
)
