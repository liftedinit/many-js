import { Identity } from "../types"
import { ANONYMOUS, CoseKey } from "../../message/cose"

export class AnonymousIdentity extends Identity {
  publicKey = ANONYMOUS
  async sign() {
    return ANONYMOUS
  }
  async verify() {
    return false
  }

  getCoseKey(): CoseKey {
    const c = new Map()
    c.set(1, 1) // kty: OKP
    c.set(3, -8) // alg: EdDSA
    c.set(-1, 6) // crv: Ed25519
    c.set(4, [2]) // key_ops: [verify]
    c.set(-2, this.publicKey) // x: publicKey
    return new CoseKey(c)
  }

  toJson() {
    return this.publicKey
  }
}
