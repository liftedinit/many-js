import { asn1 as ASN1, pem as PEM, pki } from "node-forge";
import * as bip39 from "bip39";
import { CoseKey } from "../../message/encoding";
import { Identifier } from "../identifier";

const Ed25519 = pki.ed25519;

export class KeyPair extends Identifier {
  constructor(
    public publicKey: ArrayBuffer,
    private privateKey: ArrayBuffer,
  ) {
    super();
    if (new Uint8Array(privateKey).length !== 32) {
      throw new Error("Private key must have 32 bytes");
    }
  }

  async sign(data: ArrayBuffer): Promise<ArrayBuffer> {
    const sig = Ed25519.sign({
      message: new Uint8Array(data),
      privateKey: new Uint8Array(this.privateKey),
    });
    return new Uint8Array(sig);
  }

  toString(): string {
    const coseKey = this.toCoseKey();
    return new Identifier(coseKey.keyId).toString();
  }

  // @TODO: Use objToMap?
  toCoseKey(): CoseKey {
    const c = new Map();
    c.set(1, 1); // kty: OKP
    c.set(3, -8); // alg: EdDSA
    c.set(4, [2]); // key_ops: [verify]
    c.set(-1, 6); // crv: Ed25519
    c.set(-2, this.publicKey); // x: publicKey
    return new CoseKey(c);
  }

  static fromString(_: string): KeyPair {
    throw new Error("Cannot create a KeyPair identifier from a string");
  }

  static getMnemonic(): string {
    return bip39.generateMnemonic();
  }

  static fromMnemonic(mnemonic: string): KeyPair {
    const sanitized = mnemonic.trim().split(/\s+/g).join(" ");
    if (!bip39.validateMnemonic(sanitized)) {
      throw new Error(`Invalid mnemonic: ${mnemonic}`);
    }
    const seed = bip39.mnemonicToSeedSync(sanitized).slice(0, 32);
    const keys = Ed25519.generateKeyPair({ seed });
    return new KeyPair(keys.publicKey, keys.privateKey.slice(0, 32));
  }

  static fromPem(pem: string): KeyPair {
    try {
      const der = PEM.decode(pem)[0].body;
      const asn1 = ASN1.fromDer(der.toString());
      const { privateKeyBytes } = Ed25519.privateKeyFromAsn1(asn1);

      const keys = Ed25519.generateKeyPair({ seed: privateKeyBytes });
      return new KeyPair(keys.publicKey, keys.privateKey.slice(0, 32));
    } catch (e) {
      throw new Error(`Invalid PEM: ${pem}`);
    }
  }
}
