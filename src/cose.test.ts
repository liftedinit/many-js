import * as cose from "./cose";

describe("cose", () => {
  test.skip("encodeCoseKey", () => {});
});

describe("OmniError", function () {
  it('replaces fields', () => {
    const error = {
      [0]: 123,
      [1]: "Hello {0} and {2}.",
      [2]: {
        "0": "ZERO",
        "1": "ONE",
        "2": "TWO",
      }
    };
    const err = new cose.OmniError(error);

    expect(err.toString()).toBe("Error: Hello ZERO and TWO.");
  });

  it('works with double brackets', () => {
    const error = {
      [0]: 123,
      [1]: "/{{}}{{{0}}}{{{a}}}{b}}}{{{2}.",
      [2]: {
        "0": "ZERO",
        "1": "ONE",
        "2": "TWO",
      }
    };
    const err = new cose.OmniError(error);

    expect(err.toString()).toBe("Error: /{}{ZERO}{}}{TWO.");
  });
});
