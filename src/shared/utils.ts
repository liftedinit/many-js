export function makeRandomBytes(size = 32) {
  return crypto.getRandomValues(new Uint8Array(size));
}

// From String

export function strToBytes(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

export function strToBuffer(str: string): ArrayBuffer {
  return bytesToBuffer(strToBytes(str));
}

// From Hex String

export function hexToBytes(hex: string): Uint8Array {
  const match = hex.match(/.{1,2}/g);
  return match
    ? Uint8Array.from(match.map((byte) => parseInt(byte, 16)))
    : new Uint8Array();
}

export function hexToBuffer(hex: string): ArrayBuffer {
  return bytesToBuffer(hexToBytes(hex));
}

// Usage: h`d284587a` => UintArray [64 32 38 34 35 38 37 61]
export function h(str: TemplateStringsArray): Uint8Array {
  return hexToBytes(str[0]);
}

// From "Bytes" (Uint8Array)

export function bytesToBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteLength + bytes.byteOffset,
  );
}

export function bytesToStr(bytes: Uint8Array): string {
  return bufferToStr(bytes.buffer);
}

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((i) => i.toString(16).padStart(2, "0"))
    .join("");
}

export function compareBytes(a: Uint8Array, b: Uint8Array): boolean {
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

// From "Buffer" (ArrayBuffer)

export function bufferToStr(buf: ArrayBuffer): string {
  return new TextDecoder().decode(buf);
}
