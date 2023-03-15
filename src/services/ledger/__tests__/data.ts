export const mockInfoObj = {
  hash: "abc123",
  tokens: {
    mxyz789: { name: "Test Token", symbol: "TTT", precision: 9 },
  },
};

export const mockInfoMap = new Map<number, any>([
  [1, "abc123"],
  [
    5,
    new Map([
      [
        "mxyz789",
        new Map<number, any>([
          [0, "Test Token"],
          [1, "TTT"],
          [2, 9],
        ]),
      ],
    ]),
  ],
]);

export const mockBalanceObj = {
  balances: {
    mxyz789: 100000000,
  },
};

export const mockBalanceMap = new Map([[0, new Map([["mxyz789", 100000000]])]]);
