import cbor from "cbor"
import { UserIdentity } from "../types"

const CHALLENGE_BUFFER = new TextEncoder().encode("lifted")

export class WebAuthnUserIdentity extends UserIdentity {
  publicKey: ArrayBuffer
  rawId: ArrayBuffer

  constructor(publicKey: ArrayBuffer, rawId: ArrayBuffer) {
    super()
    this.publicKey = publicKey
    this.rawId = rawId
  }

  static async create() {
    const publicKeyCredential = await createPublicKeyCredential()
    const attestationResponse =
      publicKeyCredential.response as AuthenticatorResponse &
        AuthenticatorAttestationResponse

    const attestationObj = cbor.decodeFirstSync(
      attestationResponse.attestationObject,
    )
    const publicKeyBytes = getPublicKeyBytesFromAuthData(
      attestationObj.authData,
    )

    return new WebAuthnUserIdentity(publicKeyBytes, publicKeyCredential.rawId)
  }

  async sign(data: ArrayBuffer): Promise<ArrayBuffer> {
    const publicKey: PublicKeyCredentialRequestOptions = {
      challenge: data,
      allowCredentials: [
        {
          id: this.rawId,
          type: "public-key",
        },
      ],
    }
    let credential = (await window.navigator.credentials.get({
      publicKey,
    })) as PublicKeyCredential

    return (credential.response as AuthenticatorAssertionResponse).signature
  }

  async verify(m: ArrayBuffer): Promise<boolean> {
    return false
  }
}

async function createPublicKeyCredential() {
  const publicKey: PublicKeyCredentialCreationOptions = {
    challenge: CHALLENGE_BUFFER,

    rp: {
      name: "lifted",
    },

    user: {
      id: window.crypto.getRandomValues(new Uint8Array(32)),
      name: "Lifted",
      displayName: "Lifted",
    },

    attestation: "direct",

    pubKeyCredParams: [
      {
        type: "public-key",
        alg: -7,
      },
    ],
  }

  return (await navigator.credentials.create({
    publicKey,
  })) as PublicKeyCredential
}

function getPublicKeyBytesFromAuthData(authData: ArrayBuffer): ArrayBuffer {
  const dataView = new DataView(new ArrayBuffer(2))
  const idLenBytes = authData.slice(53, 55)
  // @ts-ignore
  idLenBytes.forEach((value, index) => dataView.setUint8(index, value))
  const credentialIdLength = dataView.getUint16(0)
  const publicKeyBytes = authData.slice(55 + credentialIdLength)
  return publicKeyBytes
}
