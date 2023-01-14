import { KeyValue } from "../keyvalue"
import {
  mockGetMap,
  mockGetObj,
  mockInfoMap,
  mockInfoObj,
  mockPutMap,
} from "./data"

const mockCall = jest.spyOn(KeyValue.prototype, "call")
const server = new KeyValue("localhost")

describe("keyvalue", () => {
  describe("info", () => {
    it("should return information about the keyvalue service", async () => {
      mockCall.mockResolvedValue(mockInfoMap)
      const info = await server.info()

      expect(info).toStrictEqual(mockInfoObj)
    })
  })
  describe("get", () => {
    it("should return the correct value", async () => {
      mockCall.mockResolvedValue(mockGetMap)
      const get = await server.get({ key: "foo" })

      expect(get).toStrictEqual(mockGetObj)
    })
  })
  describe("put", () => {
    it("should be called with the correct arguments", async () => {
      mockCall.mockReset()
      await server.put({ key: "foo", value: "bar" })

      expect(mockCall).toHaveBeenCalledWith("kvstore.put", mockPutMap)
    })
  })
})