import forge from "node-forge";
import * as bip39 from "bip39";

export type Key = Uint8Array;

export type KeyPair = {
  privateKey: Key;
  publicKey: Key;
};

const ed25519 = forge.pki.ed25519;

export function getSeedWords(): string {
  return bip39.generateMnemonic();
}

export function fromSeedWords(mnemonic: string): KeyPair {
  const seed = bip39.mnemonicToSeedSync(mnemonic).slice(0, 32);
  const keys = ed25519.generateKeyPair({ seed });
  return keys;
}

export function fromPem(pem: string): KeyPair {
  const der = forge.pem.decode(pem)[0].body;
  const asn1 = forge.asn1.fromDer(der.toString());
  const { privateKeyBytes } = ed25519.privateKeyFromAsn1(asn1);
  const keys = ed25519.generateKeyPair({ seed: privateKeyBytes });
  return keys;
}
