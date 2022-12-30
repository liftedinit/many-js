import { Identifier } from "../identifier"

export class WebAuthn extends Identifier {
  constructor(
    readonly publicKey: Uint8Array,
    readonly credential: PublicKeyCredential,
  ) {
    super()
  }
}
