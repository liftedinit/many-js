// import { addExtension, Encoder } from "cbor-x";

export type CborData = Uint8Array;
export type CborMap = Map<string | number, any>;

// @TODO: Add extensions to automatically encode/decode tags 10000, 10001
// const encoder = new Encoder({
//   mapsAsObjects: false,
//   useRecords: false,
//   tagUint8Array: false,
// });
// export const encode = encoder.encode;
// export const decode = encoder.decode;
// export const extend = addExtension;

export function cborDataFromString(
  string: string,
  encoding: string = "utf8",
): CborData {
  switch (encoding) {
    case "hex":
      return Uint8Array.from(
        string.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)),
      );
    case "utf8":
    case "utf-8":
    default:
      return new TextEncoder().encode(string);
  }
}

export function cborDataToString(
  data: CborData,
  encoding: string = "utf8",
): string {
  switch (encoding) {
    case "hex":
      // return data.reduce(
      //   (acc, val) => acc + ("0" + val.toString(16)).slice(-2),
      //   "",
      // );
      return Array.from(data)
        .map((i) => i.toString(16).padStart(2, "0"))
        .join("");
    case "utf8":
    case "utf-8":
    default:
      return new TextDecoder().decode(data.buffer);
  }
}

export function compare(a: Uint8Array, b: Uint8Array) {
  if (a.length !== b.length) {
    return false;
  }
  for (let i = a.length; i >= 0; i--) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}
