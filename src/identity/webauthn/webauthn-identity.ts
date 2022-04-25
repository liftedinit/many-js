import cbor from "cbor"
import { Identity } from "../types"

const CHALLENGE_BUFFER = new TextEncoder().encode("lifted")

export class WebAuthnIdentity extends Identity {
  publicKey: ArrayBuffer
  rawId: ArrayBuffer

  constructor(publicKey: ArrayBuffer, rawId: ArrayBuffer) {
    super()
    this.publicKey = publicKey
    this.rawId = rawId
  }

  static async create(): Promise<WebAuthnIdentity> {
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

    return new WebAuthnIdentity(publicKeyBytes, publicKeyCredential.rawId)
  }

  async sign(data: ArrayBuffer): Promise<ArrayBuffer> {
    const credential = await WebAuthnIdentity.getCredential(this.rawId, data)
    const signature = (credential.response as AuthenticatorAssertionResponse)
      .signature
    return new Uint8Array(signature)
  }

  async verify(m: ArrayBuffer): Promise<boolean> {
    return false
  }

  static async getCredential(
    credentialId: ArrayBuffer,
    challenge?: Uint8Array | ArrayBuffer,
  ): Promise<PublicKeyCredential> {
    let credential = (await window.navigator.credentials.get({
      publicKey: {
        challenge: challenge ?? CHALLENGE_BUFFER,
        timeout: 10000,
        allowCredentials: [
          {
            transports: ["nfc", "usb"],
            id: credentialId,
            type: "public-key",
          },
        ],
      },
    })) as PublicKeyCredential
    return credential
  }

  toJson(): { rawId: string; publicKey: ArrayBuffer } {
    return {
      rawId: Buffer.from(this.rawId).toString("base64"),
      publicKey: this.publicKey,
    }
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

    authenticatorSelection: {
      authenticatorAttachment: "cross-platform",
    },

    pubKeyCredParams: [
      {
        /*
          EdDSA	-8
          ES256	-7	ECDSA w/ SHA-256
        */
        type: "public-key",
        alg: -8,
        // alg: -7,
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
