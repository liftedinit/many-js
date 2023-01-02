import { Identity } from "../types"
import { EMPTY } from "../../message/cose"
import { Address } from "../address"

export class AnonymousIdentity extends Identity {
  // This constant string is from a previous mangling of the constructor name
  // and should be used to maintained backward compatibility with existing
  // local storages.
  static dataType = 'r'

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
    return { dataType: (this.constructor as typeof Identity).dataType }
  }
}
