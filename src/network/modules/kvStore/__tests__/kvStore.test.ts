import { KvStore } from "../kvStore"
import { setupModule } from "../../test/test-utils"

describe("KVStore", () => {
  const mockCall = jest.fn(async () => {})
  const kvStore = setupModule(KvStore, mockCall)

  describe.skip("info", () => {})
  describe.skip("get", () => {})
  describe.skip("put", () => {})
  describe.skip("query", () => {})
  describe.skip("disable", () => {})
})
