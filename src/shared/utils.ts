import * as nodeCrypto from "crypto"

export function makeRandomBytes(size = 32) {
  if (typeof globalThis.crypto === "undefined") {
    return nodeCrypto.randomBytes(size)
  }
  return crypto.getRandomValues(new Uint8Array(size))
}
