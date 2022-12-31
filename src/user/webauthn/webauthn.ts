import cbor from "cbor"
import { CoseKey } from "../../message/encoding"
import { Identifier } from "../identifier"

export class WebAuthn extends Identifier {
  readonly publicKey: Uint8Array
  readonly coseKey: CoseKey

  constructor(readonly credential: PublicKeyCredential) {
    super()
    this.coseKey = this.getCoseKey()
    this.publicKey = this.coseKey.publicKey
  }

  private getCoseKey(): CoseKey {
    const { attestationObject } = this.credential
      .response as AuthenticatorAttestationResponse
    const { authData } = cbor.decodeFirstSync(attestationObject)

    const dataView = new DataView(new ArrayBuffer(2))
    const idLenBytes = authData.slice(53, 55)
    // @ts-ignore
    idLenBytes.forEach((value, index) => dataView.setUint8(index, value))
    const credentialIdLength = dataView.getUint16(0)
    const publicKeyBytes = authData.slice(55 + credentialIdLength)

    return new CoseKey(cbor.decodeFirstSync(publicKeyBytes))
  }
}
