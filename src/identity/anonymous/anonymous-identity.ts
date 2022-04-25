import { Identity } from "../types"
import { ANONYMOUS } from "../../message/cose"

export class AnonymousIdentity extends Identity {
  publicKey = ANONYMOUS
  async sign() {
    return ANONYMOUS
  }
  async verify() {
    return false
  }

  toJson() {
    return this.publicKey
  }
}
