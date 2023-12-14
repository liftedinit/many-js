import { strToBytes } from "../../../shared/utils";
import { CoseKey } from "../cose-key";

describe("CoseKey", () => {
  describe("constructor", () => {
    it("should return a CoseKey", () => {
      const cosekey = new CoseKey(new Map([[-2, strToBytes("foo")]]));

      expect(cosekey instanceof CoseKey).toBe(true);
    });
  });
});
