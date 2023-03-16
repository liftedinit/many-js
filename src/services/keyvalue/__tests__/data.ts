import { fromString } from "../../../shared/utils";

export const mockInfoObj = {
  hash: "abc123",
};

export const mockInfoMap = new Map<number, any>([
  [0, fromString("abc123", "hex")],
]);

export const mockGetObj = {
  value: "bar",
};

export const mockGetMap = new Map<number, any>([[0, fromString("bar")]]);

export const mockPutMap = new Map<number, any>([
  [0, fromString("foo")],
  [1, fromString("bar")],
]);
