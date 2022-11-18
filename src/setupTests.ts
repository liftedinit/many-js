import crypto from "crypto"

// Necessary because we're testing in the Node environment but using the WebCrypto API
Object.defineProperty(global, "crypto", {
  value: { getRandomValues: (arr: any) => crypto.randomBytes(arr.length) },
})
