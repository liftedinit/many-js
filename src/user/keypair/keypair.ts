import forge, { pki } from "node-forge"
import * as bip39 from "bip39"
import { CoseKey } from "../../message/encoding"
import { Identifier } from "../identifier"

const ed25519 = pki.ed25519

export class KeyPair extends Identifier {
  constructor(
    readonly publicKey: ArrayBuffer,
    private privateKey: ArrayBuffer,
  ) {
    super()
    if (new Uint8Array(privateKey).length !== 32) {
      throw new Error("Private key must have 32 bytes")
    }
  }

  sign(data: ArrayBuffer): ArrayBuffer {
    return ed25519.sign({
      message: data as Uint8Array,
      privateKey: this.privateKey as Uint8Array,
    })
  }

  // @TODO: Use objToMap?
  toCoseKey(): CoseKey {
    const c = new Map()
    c.set(1, 1) // kty: OKP
    c.set(3, -8) // alg: EdDSA
    c.set(-1, 6) // crv: Ed25519
    c.set(4, [2]) // key_ops: [verify]
    c.set(-2, this.publicKey) // x: publicKey
    return new CoseKey(c)
  }

  static fromString(_: string): KeyPair {
    throw new Error("Cannot create a KeyPair from a string")
  }

  static getMnemonic(): string {
    return bip39.generateMnemonic()
  }

  static fromMnemonic(mnemonic: string): KeyPair {
    const sanitized = mnemonic.trim().split(/\s+/g).join(" ")
    if (!bip39.validateMnemonic(sanitized)) {
      throw new Error(`Invalid mnemonic: ${mnemonic}`)
    }
    const seed = bip39.mnemonicToSeedSync(sanitized).slice(0, 32)
    const keys = ed25519.generateKeyPair({ seed })
    return new KeyPair(keys.publicKey, keys.privateKey.slice(0, 32))
  }

  static fromPem(pem: string): KeyPair {
    try {
      const der = forge.pem.decode(pem)[0].body
      const asn1 = forge.asn1.fromDer(der.toString())
      const { privateKeyBytes } = ed25519.privateKeyFromAsn1(asn1)

      const keys = ed25519.generateKeyPair({ seed: privateKeyBytes })
      return new KeyPair(keys.publicKey, keys.privateKey.slice(0, 32))
    } catch (e) {
      throw new Error(`Invalid PEM: ${pem}`)
    }
  }
}
