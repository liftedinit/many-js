export function makeRandomBytes(size = 32) {
  if (globalThis?.crypto) {
    return crypto.getRandomValues(new Uint8Array(size));
  }
  return require("crypto").randomBytes(size);
}
