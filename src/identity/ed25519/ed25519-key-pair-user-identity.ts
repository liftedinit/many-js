import { pki } from "node-forge"
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

  toJson() {
    return {
      publicKey: this.publicKey,
      privateKey: this.privateKey,
    }
  }
}
