export const mockInfoObj = {
  hash: "abc123",
}

export const mockInfoMap = new Map<number, any>([
  [0, Buffer.from("abc123", "hex")],
])

export const mockGetObj = {
  value: "bar",
}

export const mockGetMap = new Map<number, any>([[0, Buffer.from("bar")]])

export const mockPutMap = new Map<number, any>([
  [0, Buffer.from("foo")],
  [1, Buffer.from("bar")],
])
