import base32Decode from "base32-decode";
import base32Encode from "base32-encode";
import crc from "crc";

import { Key } from "./keys";
import { toIdentity } from "./cose";

export type Identity = Buffer;

export function fromBuffer(buffer: Uint8Array): Identity {
  return buffer as Identity;
}

export function fromPublicKey(key: Key): Identity {
  return toIdentity(key);
}

export function fromString(string: string): Identity {
  const base32Identity = string.slice(1, -2).toUpperCase();
  const identity = base32Decode(base32Identity, "RFC4648");
  return Buffer.from(identity);
}

export function toString(identity?: Identity): string {
  if (!identity) {
    return "oaa";
  }
  const checksum = Buffer.allocUnsafe(3);
  checksum.writeUInt16BE(crc.crc16(identity), 0);

  const leader = "o";
  const base32Identity = base32Encode(identity, "RFC4648", {padding: false});
  const base32Checksum = base32Encode(checksum, "RFC4648").slice(0, 2);
  return (leader + base32Identity + base32Checksum).toLowerCase();
}

export function fromHex(hex: string): Identity {
  return Buffer.from(hex, "hex");
}

export function toHex(identity?: Identity): string {
  if (!identity) {
    return "00";
  }
  return identity.toString("hex");
}
