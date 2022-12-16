import { KvStore } from "../kvStore"
import { setupModule } from "../../test/test-utils"
import { mockKVStoreInfoMessage } from "./data"

describe("KVStore", () => {
  const mockCall = jest.fn(async () => mockKVStoreInfoMessage)
  const kvStore = setupModule(KvStore, mockCall)

  describe("info", () => {
    it("should call the info method", async () => {
      await kvStore.info()

      expect(mockCall).toHaveBeenCalled()
    })
  })
  describe.skip("get", () => {})
  describe.skip("put", () => {})
  describe.skip("query", () => {})
  describe.skip("disable", () => {})
})
