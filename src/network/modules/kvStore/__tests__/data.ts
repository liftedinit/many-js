import { makeMockResponseMessage } from "../../test/test-utils"

export const mockKVStoreInfoMessage = makeMockResponseMessage(
  new Map([[0, Buffer.from([0]).toString("hex")]]),
)
