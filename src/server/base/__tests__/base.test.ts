import { Base } from "../../base"
import {
  mockEndpointsMap,
  mockEndpointsObj,
  mockStatusMap,
  mockStatusObj,
} from "./data"

const mockCall = jest.spyOn(Base.prototype, "call")
const server = new Base("localhost")

describe("base", () => {
  describe("endpoints", () => {
    it("should return an array of endpoints", async () => {
      // @ts-ignore
      mockCall.mockResolvedValue(mockEndpointsMap)
      const endpoints = await server.endpoints()

      expect(endpoints).toStrictEqual(mockEndpointsObj)
    })
  })
  describe("heartbeat", () => {
    it("should be called", async () => {
      await server.heartbeat()

      expect(mockCall).toHaveBeenCalledWith("heartbeat")
    })
  })
  describe("status", () => {
    it("should return the server status", async () => {
      mockCall.mockResolvedValue(mockStatusMap)
      const status = await server.status()

      expect(status).toStrictEqual(mockStatusObj)
    })
  })
})
