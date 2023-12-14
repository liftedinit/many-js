import { hexToBytes, strToBuffer } from "../../../shared/utils";

export const mockInfoObj = { hash: "abc123" };
export const mockInfoMap = new Map<number, any>([[0, hexToBytes("abc123")]]);

export const mockGetObj = { value: "bar" };
export const mockGetMap = new Map<number, any>([[0, strToBuffer("bar")]]);

export const mockPutMap = new Map<number, any>([
  [0, strToBuffer("foo")],
  [1, strToBuffer("bar")],
]);
