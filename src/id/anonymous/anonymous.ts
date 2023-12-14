import { CoseKey } from "../../message/encoding";
import { Identifier } from "../identifier";

export class Anonymous extends Identifier {
  async sign(_: ArrayBuffer): Promise<ArrayBuffer> {
    return new ArrayBuffer(0);
  }

  toString(): string {
    return "maa";
  }

  toCoseKey(): CoseKey {
    throw new Error("Cannot convert Anonymous identifier to CoseKey");
  }

  static fromString(string: string): Anonymous {
    if (string === "maa") {
      return new Anonymous();
    }
    throw new Error(`Cannot create Anonymous from string: ${string}`);
  }
}
