import { asn1 as ASN1, pem as PEM, pki } from "node-forge";
import * as bip39 from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english";
import * as ed from "@noble/ed25519";
import { sha512 } from "@noble/hashes/sha512";
ed.etc.sha512Sync = (...m) => sha512(ed.etc.concatBytes(...m));

import { CoseKey } from "../../message/encoding";
import { Identifier } from "../identifier";
import { bytesToBuffer } from "../../shared/utils";

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
    if (publicKey instanceof Uint8Array) {
      this.publicKey = bytesToBuffer(publicKey);
    }
  }

  async sign(data: ArrayBuffer): Promise<ArrayBuffer> {
    const sig = ed.sign(new Uint8Array(data), new Uint8Array(this.privateKey));
    return sig;
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
    return bip39.generateMnemonic(wordlist);
  }

  static fromMnemonic(mnemonic: string): KeyPair {
    const sanitized = mnemonic.trim().split(/\s+/g).join(" ");
    if (!bip39.validateMnemonic(sanitized, wordlist)) {
      throw new Error(`Invalid mnemonic: ${mnemonic}`);
    }
    const seed = bip39.mnemonicToSeedSync(sanitized).slice(0, 32);
    return new KeyPair(ed.getPublicKey(seed), seed);
  }

  static fromPem(pem: string): KeyPair {
    try {
      const der = PEM.decode(pem)[0].body;
      const asn1 = ASN1.fromDer(der.toString());
      const { privateKeyBytes } = Ed25519.privateKeyFromAsn1(asn1);

      return new KeyPair(
        ed.getPublicKey(privateKeyBytes),
        privateKeyBytes.slice(0, 32),
      );
    } catch (e) {
      throw new Error(`Invalid PEM: ${pem}`);
    }
  }
}
