import base32Decode from "base32-decode";
import base32Encode from "base32-encode";
import crc from "crc";
import { toIdentity } from "./cose";
export function fromBuffer(buffer) {
    return buffer;
}
export function fromPublicKey(key) {
    return toIdentity(key);
}
export function fromString(string) {
    const base32Identity = string.slice(1, -2).toUpperCase();
    const identity = base32Decode(base32Identity, "RFC4648");
    return Buffer.from(identity);
}
export function toString(identity) {
    if (!identity) {
        return "oaa";
    }
    const checksum = Buffer.allocUnsafe(3);
    checksum.writeUInt16BE(crc.crc16(identity), 0);
    const leader = "o";
    const base32Identity = base32Encode(identity, "RFC4648").slice(0, -1);
    const base32Checksum = base32Encode(checksum, "RFC4648").slice(0, 2);
    return (leader + base32Identity + base32Checksum).toLowerCase();
}
export function fromHex(hex) {
    return Buffer.from(hex, "hex");
}
export function toHex(identity) {
    if (!identity) {
        return "00";
    }
    return identity.toString("hex");
}
