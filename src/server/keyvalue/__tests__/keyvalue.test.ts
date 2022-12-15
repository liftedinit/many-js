import { KeyValue } from "../../keyvalue"
import { mockInfoMap, mockInfoObj } from "./data"

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
})
