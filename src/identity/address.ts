import base32Decode from "base32-decode"
import base32Encode from "base32-encode"
import crc from "crc"

import { Key } from "../keys"
import { CoseKey } from "../message/cose"
import { Identity } from "./types"

export const ANON_IDENTITY = "maa"
export class Address {
  bytes: Uint8Array

  constructor(bytes?: Buffer) {
    this.bytes = new Uint8Array(bytes ? bytes : [0x00])
  }

  static anonymous(): Address {
    return new Address()
  }

  static fromHex(hex: string): Address {
    return new Address(Buffer.from(hex, "hex"))
  }

  // static fromPublicKey(key: Key): Address {
  //   // const coseKey = new CoseKey(key)
  //   const coseKey = new CoseKey(key)
  //   return coseKey.toAddress()
  // }

  static fromIdentity(i: Identity): Address {
    const coseKey = i.getCoseKey()
    return coseKey.toAddress()
  }

  static fromString(string: string): Address {
    if (string === ANON_IDENTITY) {
      return new Address()
    }
    const base32Address = string.slice(1, -2).toUpperCase()
    const base32Checksum = string.slice(-2).toUpperCase()
    const identity = base32Decode(base32Address, "RFC4648")
    const checksum = base32Decode(base32Checksum, "RFC4648")

    const check = Buffer.allocUnsafe(3)
    check.writeUInt16BE(crc.crc16(Buffer.from(identity)), 0)

    if (Buffer.compare(Buffer.from(checksum), check.slice(0, 1)) !== 0) {
      throw new Error("Invalid Checksum")
    }

    return new Address(Buffer.from(identity))
  }

  isAnonymous(): boolean {
    return Buffer.compare(this.toBuffer(), Buffer.from([0x00])) === 0
  }

  toBuffer(): Buffer {
    return Buffer.from(this.bytes)
  }

  toString(): string {
    if (this.isAnonymous()) {
      return ANON_IDENTITY
    }
    const identity = this.toBuffer()
    const checksum = Buffer.allocUnsafe(3)
    checksum.writeUInt16BE(crc.crc16(identity), 0)

    const leader = "m"
    const base32Address = base32Encode(identity, "RFC4648", {
      padding: false,
    })
    const base32Checksum = base32Encode(checksum, "RFC4648").slice(0, 2)
    return (leader + base32Address + base32Checksum).toLowerCase()
  }

  toHex(): string {
    if (this.isAnonymous()) {
      return "00"
    }
    return Buffer.from(this.bytes).toString("hex")
  }

  withSubresource(id: number): Address {
    let bytes = Buffer.from(this.bytes.slice(0, 29))
    bytes[0] = 0x80 + ((id & 0x7f000000) >> 24)
    const subresourceBytes = Buffer.from([
      (id & 0x00ff0000) >> 16,
      (id & 0x0000ff00) >> 8,
      id & 0x000000ff,
    ])
    return new Address(Buffer.concat([bytes, subresourceBytes]))
  }
}
