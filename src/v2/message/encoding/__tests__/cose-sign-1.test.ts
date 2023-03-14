import { CoseSign1 } from "../cose-sign-1"

describe("CoseSign1", () => {
  describe("constructor", () => {
    it("should return a CoseSign1", () => {
      const cosesign1 = new CoseSign1(
        new Map(),
        new Map(),
        new Map(),
        new ArrayBuffer(0),
      )

      expect(cosesign1 instanceof CoseSign1).toBe(true)
    })
  })
})
