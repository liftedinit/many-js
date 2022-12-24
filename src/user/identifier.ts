import base32Decode from "base32-decode"
import base32Encode from "base32-encode"
import crc from "crc"

export class Identifier {
  constructor(readonly publicKey: ArrayBuffer = new Uint8Array([0x00])) {}

  sign(_: ArrayBuffer): ArrayBuffer {
    throw new Error("Generic identifier cannot sign")
  }

  toString(): string {
    const address = Buffer.from(this.publicKey)
    const checksum = Buffer.allocUnsafe(3)
    checksum.writeUInt16BE(crc.crc16(address), 0)

    const leader = "m"
    const base32Address = base32Encode(address, "RFC4648", {
      padding: false,
    })
    const base32Checksum = base32Encode(checksum, "RFC4648").slice(0, 2)
    return (leader + base32Address + base32Checksum).toLowerCase()
  }

  withSubresource(sub: number): Identifier {
    let bytes = Buffer.from(this.publicKey.slice(0, 29))
    bytes[0] = 0x80 + ((sub & 0x7f000000) >> 24)
    const subresourceBytes = Buffer.from([
      (sub & 0x00ff0000) >> 16,
      (sub & 0x0000ff00) >> 8,
      sub & 0x000000ff,
    ])
    return new Identifier(Buffer.concat([bytes, subresourceBytes]))
  }

  static fromString(string: string): Identifier {
    if (string === "maa") {
      return new Identifier()
    }
    const base32Address = string.slice(1, -2).toUpperCase()
    const base32Checksum = string.slice(-2).toUpperCase()
    const address = base32Decode(base32Address, "RFC4648")
    const checksum = base32Decode(base32Checksum, "RFC4648")

    const check = Buffer.allocUnsafe(3)
    check.writeUInt16BE(crc.crc16(Buffer.from(address)), 0)
    if (Buffer.compare(Buffer.from(checksum), check.slice(0, 1)) !== 0) {
      throw new Error(`Invalid checksum: ${checksum}`)
    }

    return new Identifier(Buffer.from(address))
  }
}
