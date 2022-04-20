import { pki } from "node-forge"
const ed25519 = pki.ed25519
import { KeyPairUserIdentity } from "../types"

export class Ed25519KeyPairUserIdentity extends KeyPairUserIdentity {
  publicKey: ArrayBuffer
  privateKey: ArrayBuffer
  constructor(publicKey: ArrayBuffer, privateKey: ArrayBuffer) {
    super()
    this.publicKey = publicKey
    this.privateKey = privateKey
  }
  async sign(data: ArrayBuffer): Promise<ArrayBuffer> {
    return Buffer.from(
      ed25519.sign({
        message: new Uint8Array(data),
        privateKey: new Uint8Array(this.privateKey),
      }),
    )
  }
  async verify(m: ArrayBuffer): Promise<boolean> {
    return false
  }
}
