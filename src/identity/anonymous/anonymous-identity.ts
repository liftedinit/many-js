import { Identity } from "../types"
import { EMPTY } from "../../message/encoding"
import { Address } from "../address"

export class AnonymousIdentity extends Identity {
  async sign() {
    return EMPTY
  }
  async verify() {
    return false
  }

  async getAddress(): Promise<Address> {
    return Address.anonymous()
  }

  toJSON(): { dataType: string } {
    return { dataType: this.constructor.name }
  }
}
