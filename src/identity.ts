import base32 from "base32-encode";
import cbor from "cbor";
import crc from "crc";

import { Key } from "./keys";
import { encodeCoseKey } from "./cose";

export type Identity = Buffer; // COSE Key

export function fromPublicKey(key: Key): Identity {
  return encodeCoseKey(key);
}

export function toPublicKey(identity: Identity): Key {
  const [coseKey] = cbor.decode(identity);
  return coseKey.get(-2);
}

export function fromString(string: string): Identity {
  throw new Error("Not implemented.");
}

export function toString(identity?: Identity): string {
  if (!identity) {
    return "oaa";
  }
  const checksum = Buffer.allocUnsafe(3);
  checksum.writeUInt16BE(crc.crc16(identity), 0);

  const leader = "o";
  const base32Identity = base32(identity, "RFC4648").slice(0, -1);
  const base32Checksum = base32(checksum, "RFC4648").slice(0, 2);
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
