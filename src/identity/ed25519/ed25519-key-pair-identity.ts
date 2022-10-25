import forge, { pki } from "node-forge"
import * as bip39 from "bip39"
import { CoseKey } from "../../message/cose"
const ed25519 = pki.ed25519
import { PublicKeyIdentity } from "../types"
import { Address } from "../address"

export class Ed25519KeyPairIdentity extends PublicKeyIdentity {
  publicKey: ArrayBuffer
  protected privateKey: ArrayBuffer

  protected constructor(publicKey: ArrayBuffer, privateKey: ArrayBuffer) {
    super()
    this.publicKey = publicKey
    this.privateKey = privateKey
  }

  static getMnemonic(): string {
    return bip39.generateMnemonic()
  }

  async getAddress(): Promise<Address> {
    const coseKey = this.getCoseKey()
    return coseKey.toAddress()
  }

  static fromMnemonic(mnemonic: string): Ed25519KeyPairIdentity {
    const sanitized = mnemonic.trim().split(/\s+/g).join(" ")
    if (!bip39.validateMnemonic(sanitized)) {
      throw new Error("Invalid Mnemonic")
    }
    const seed = bip39.mnemonicToSeedSync(sanitized).slice(0, 32)
    return Ed25519KeyPairIdentity.fromHex(seed)
  }

  static fromHex(hex: string | pki.ed25519.NativeBuffer) {
    const keys = ed25519.generateKeyPair({ seed: hex })
    return new Ed25519KeyPairIdentity(keys.publicKey, keys.privateKey)
  }

  static fromPem(pem: string): Ed25519KeyPairIdentity {
    try {
      const der = forge.pem.decode(pem)[0].body
      const asn1 = forge.asn1.fromDer(der.toString())
      const { privateKeyBytes } = ed25519.privateKeyFromAsn1(asn1)
      return Ed25519KeyPairIdentity.fromHex(privateKeyBytes)
    } catch (e) {
      throw new Error("Invalid PEM")
    }
  }

  async sign(data: ArrayBuffer): Promise<ArrayBuffer> {
    return ed25519.sign({
      message: data as Uint8Array,
      privateKey: this.privateKey as Uint8Array,
    })
  }
  async verify(m: ArrayBuffer): Promise<boolean> {
    throw new Error("Method not implemented.")
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

  toJSON(): {
    dataType: string
    publicKey: ArrayBuffer
    privateKey: ArrayBuffer
  } {
    return {
      dataType: this.constructor.name,
      publicKey: this.publicKey,
      privateKey: this.privateKey,
    }
  }
}
