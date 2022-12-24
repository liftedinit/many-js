import { Identifier } from "../identifier"

export class Anonymous extends Identifier {
  sign(_: ArrayBuffer): ArrayBuffer {
    return Buffer.alloc(0)
  }

  toString(): string {
    return "maa"
  }

  static fromString(string: string): Anonymous {
    if (string === "maa") {
      return new Anonymous()
    }
    throw new Error(`Cannot create Anonymous from string: ${string}`)
  }
}
