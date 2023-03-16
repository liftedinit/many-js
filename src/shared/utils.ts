export function makeRandomBytes(size = 32) {
  if (globalThis?.crypto) {
    return crypto.getRandomValues(new Uint8Array(size));
  }
  return require("crypto").randomBytes(size);
}

export function toString(array: Uint8Array, encoding: string = "utf8") {
  switch (encoding) {
    case "hex":
      return Array.from(array)
        .map((i) => i.toString(16).padStart(2, "0"))
        .join("");
    case "utf8":
    case "utf-8":
    default:
      return new TextDecoder().decode(array);
  }
}

export function fromString(string: string, encoding: string = "utf8") {
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
