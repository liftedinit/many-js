import forge from "node-forge";
import * as bip39 from "bip39";
import base32 from "base32-encode";
import crc from "crc";
import { calculateKid } from "./cose";
const ed25519 = forge.pki.ed25519;
const ANONYMOUS = Buffer.from([0x00]);
export function getSeedWords() {
    return bip39.generateMnemonic();
}
export function fromSeedWords(mnemonic) {
    const seed = bip39.mnemonicToSeedSync(mnemonic).slice(0, 32);
    const keys = ed25519.generateKeyPair({ seed });
    return keys;
}
export function fromPem(pem) {
    const der = forge.pem.decode(pem)[0].body;
    const asn1 = forge.asn1.fromDer(der.toString());
    const { privateKeyBytes } = ed25519.privateKeyFromAsn1(asn1);
    const keys = ed25519.generateKeyPair({ seed: privateKeyBytes });
    return keys;
}
export function toString(keys = null) {
    if (!keys) {
        return "oaa";
    }
    const coseKey = toCoseKey(keys);
    const checksum = crc.crc16(coseKey);
    const buffer = Buffer.allocUnsafe(3);
    buffer.writeUInt16BE(checksum, 0);
    const leader = "o";
    const basedCoseKey = base32(coseKey, "RFC4648").slice(0, -1);
    const basedChecksum = base32(buffer, "RFC4648").slice(0, 2);
    return (leader + basedCoseKey + basedChecksum).toLowerCase();
}
export function toHex(keys = null) {
    if (!keys) {
        return "00";
    }
    const coseKey = toCoseKey(keys);
    return coseKey.toString("hex");
}
export function toCoseKey(keys = null) {
    const publicKey = keys ? keys.publicKey : ANONYMOUS;
    return calculateKid(publicKey);
}
