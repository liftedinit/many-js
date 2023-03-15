export const mockStatusObj = {
  protocolVersion: 1,
  serverName: "Mock Server",
  publicKey: "abc123",
  address: "mxyz789",
  attributes: [],
  serverVersion: "RC0",
  timeDeltaInSecs: 0,
};

export const mockStatusMap = new Map<number, any>([
  [0, 1],
  [1, "Mock Server"],
  [2, "abc123"],
  [3, "mxyz789"],
  [4, []],
  [5, "RC0"],
  [6, 0],
]);

export const mockEndpointsObj = {
  endpoints: ["endpoints", "heartbeat", "status"],
};

export const mockEndpointsMap = ["endpoints", "heartbeat", "status"];
