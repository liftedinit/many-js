import { pki } from "node-forge"
import { CoseKey } from "../../message/cose"
const ed25519 = pki.ed25519
import { KeyPairIdentity } from "../types"

export class Ed25519KeyPairIdentity extends KeyPairIdentity {
  publicKey: ArrayBuffer
  privateKey: ArrayBuffer

  constructor(publicKey: ArrayBuffer, privateKey: ArrayBuffer) {
    super()
    this.publicKey = publicKey
    this.privateKey = privateKey
  }

  async sign(data: ArrayBuffer): Promise<ArrayBuffer> {
    return ed25519.sign({
      message: data as Uint8Array,
      privateKey: this.privateKey as Uint8Array,
    })
  }
  async verify(m: ArrayBuffer): Promise<boolean> {
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
    return {
      publicKey: this.publicKey,
      privateKey: this.privateKey,
    }
  }
}
