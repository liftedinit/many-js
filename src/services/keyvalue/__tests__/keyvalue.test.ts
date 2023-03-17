import { KeyValueService } from "../keyvalue";
import {
  mockGetMap,
  mockGetObj,
  mockInfoMap,
  mockInfoObj,
  mockPutMap,
} from "./data";

const call = jest.spyOn(KeyValueService.prototype, "call");
const server = new KeyValueService("localhost");

describe("keyvalue", () => {
  describe("info", () => {
    it("should return information about the keyvalue service", async () => {
      call.mockResolvedValue(mockInfoMap);
      const info = await server.info();

      expect(info).toStrictEqual(mockInfoObj);
    });
  });
  describe("get", () => {
    it("should return the correct value", async () => {
      call.mockResolvedValue(mockGetMap);
      const get = await server.get({ key: "foo" });

      expect(get).toStrictEqual(mockGetObj);
    });
  });
  describe("put", () => {
    it("should be called with the correct arguments", async () => {
      await server.put({ key: "foo", value: "bar" });

      expect(call).toHaveBeenCalledWith("kvstore.put", mockPutMap);
    });
  });
});
