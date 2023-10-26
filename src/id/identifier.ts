import base32Decode from "base32-decode";
import base32Encode from "base32-encode";
import crc from "crc";
import { CoseKey } from "../message/encoding";
import { compareBytes } from "../shared/utils";

export class Identifier {
  constructor(public publicKey: ArrayBuffer = new ArrayBuffer(0)) { }

  async sign(_: ArrayBuffer): Promise<ArrayBuffer> {
    throw new Error("Generic identifier cannot sign");
  }

  toString(): string {
    const address = new Uint8Array(this.publicKey);
    const checksum16 = new Uint16Array([crc.crc16(address)]);
    const checksum = new Uint8Array(checksum16.buffer).reverse();

    const leader = "m";
    const base32Address = base32Encode(address, "RFC4648", {
      padding: false,
    });
    const base32Checksum = base32Encode(checksum, "RFC4648").slice(0, 2);
    return (leader + base32Address + base32Checksum).toLowerCase();
  }

  toCoseKey(): CoseKey {
    throw new Error("Cannot convert generic identifier to CoseKey");
  }

  withSubresource(sub: number): Identifier {
    let bytes = new Uint8Array(this.publicKey.slice(0, 29));
    bytes[0] = 0x80 + ((sub & 0x7f000000) >> 24);
    const subresourceBytes = new Uint8Array([
      (sub & 0x00ff0000) >> 16,
      (sub & 0x0000ff00) >> 8,
      sub & 0x000000ff,
    ]);
    return new Identifier(new Uint8Array([...bytes, ...subresourceBytes]));
  }

  static fromString(string: string): Identifier {
    if (string === "maa") {
      return new Identifier();
    }
    const base32Address = string.slice(1, -2).toUpperCase();
    const base32Checksum = string.slice(-2).toUpperCase();
    const address = base32Decode(base32Address, "RFC4648");
    const checksum = base32Decode(base32Checksum, "RFC4648");

    const check16 = new Uint16Array([crc.crc16(address)]);
    const check = new Uint8Array(check16.buffer).reverse();

    if (!compareBytes(check, new Uint8Array(checksum))) {
      throw new Error(`Invalid checksum: ${checksum}`);
    }

    return new Identifier(new Uint8Array(address));
  }
}
