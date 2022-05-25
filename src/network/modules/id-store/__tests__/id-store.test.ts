import { IdStore } from "../id-store"
import {
  mockStoreResponseMessage,
  mockGetCredentialResponseMessage,
} from "./data"

describe("IdStore", () => {
  describe("idstore.store()", () => {
    it("returns symbols", async () => {
      const mockCall = jest.fn(async () => {
        return mockStoreResponseMessage
      })
      const m = new Map()
      m.set(0, "ma123")
      m.set(1, Buffer.from(new ArrayBuffer(32)))
      m.set(2, new ArrayBuffer(32))
      const idStore = setupIdStore(mockCall)
      const res = await idStore.store(
        "ma123",
        new ArrayBuffer(32),
        new ArrayBuffer(32),
      )
      expect(mockCall).toHaveBeenCalledTimes(1)
      expect(mockCall).toHaveBeenCalledWith("idstore.store", m)
      expect(res).toEqual({ phrase: "recovery phrase" })
    })
  })
  describe("idstore.getFromRecallPhrase()", () => {
    it("returns cosePublicKey and credentialId", async () => {
      const mockCall = jest.fn(async () => {
        return mockGetCredentialResponseMessage
      })
      const m = new Map()
      m.set(0, ["recall", "phrase"])
      const idStore = setupIdStore(mockCall)
      const res = await idStore.getFromRecallPhrase("recall phrase")
      expect(mockCall).toHaveBeenCalledTimes(1)
      expect(mockCall).toHaveBeenCalledWith("idstore.getFromRecallPhrase", m)
      expect(res).toEqual({
        credentialId: Buffer.from(new ArrayBuffer(32)),
        cosePublicKey: Buffer.from(new ArrayBuffer(32)),
      })
    })
  })
  describe("idstore.getFromAddress()", () => {
    it("returns cosePublicKey and credentialId", async () => {
      const mockCall = jest.fn(async () => {
        return mockGetCredentialResponseMessage
      })
      const m = new Map()
      m.set(0, "ma123")
      const idStore = setupIdStore(mockCall)
      const res = await idStore.getFromAddress("ma123")
      expect(mockCall).toHaveBeenCalledTimes(1)
      expect(mockCall).toHaveBeenCalledWith("idstore.getFromAddress", m)
      expect(res).toEqual({
        credentialId: Buffer.from(new ArrayBuffer(32)),
        cosePublicKey: Buffer.from(new ArrayBuffer(32)),
      })
    })
  })
})

function setupIdStore(callImpl?: jest.Mock) {
  const mockCall = callImpl ?? jest.fn()
  return {
    call: mockCall,
    ...IdStore,
  }
}
