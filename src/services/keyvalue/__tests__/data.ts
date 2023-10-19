import { cborDataFromString } from "../../../message/encoding";

export const mockInfoObj = {
  hash: "abc123",
};

export const mockInfoMap = new Map<number, any>([
  [0, cborDataFromString("abc123", "hex")],
]);

export const mockGetObj = {
  value: "bar",
};

export const mockGetMap = new Map<number, any>([
  [0, cborDataFromString("bar")],
]);

export const mockPutMap = new Map<number, any>([
  [0, cborDataFromString("foo")],
  [1, cborDataFromString("bar")],
]);
