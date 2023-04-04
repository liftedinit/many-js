import { makeRandomBytes } from "../utils";

describe("Utils", () => {
  describe("makeRandomBytes", () => {
    it("should return a Uint8Array", () => {
      const bytes = makeRandomBytes();
      expect(bytes instanceof Uint8Array).toBe(true);
    });
    it("should not make the same bytes each time", () => {
      expect(makeRandomBytes()).not.toStrictEqual(makeRandomBytes());
    });
  });
});
