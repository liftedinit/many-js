import { Ok, Err, unwrap } from "../result";

describe("Result", () => {
  describe("Ok", () => {
    it("should produce a result with a value", () => {
      const result = Ok("foo");

      expect(result).toHaveProperty("value");
      expect(result).not.toHaveProperty("error");
    });
  });
  describe("Err", () => {
    it("should produce a result with an error", () => {
      const result = Err(new Error("No value"));

      expect(result).toHaveProperty("error");
      expect(result).not.toHaveProperty("value");
    });
  });
  describe("unwrap", () => {
    it("should return a value from an Ok", () => {
      const result = Ok("foo");

      expect(unwrap(result)).toBe("foo");
    });
    it("should throw an error from an Err", () => {
      const result = Err(new Error("No value"));

      expect(() => unwrap(result)).toThrowError("No value");
    });
  });
});
