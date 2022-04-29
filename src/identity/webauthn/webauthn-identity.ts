import cbor from "cbor"
import { CoseKey } from "../../message/cose"
import { Identity } from "../types"

const CHALLENGE_BUFFER = new TextEncoder().encode("lifted")

export class WebAuthnIdentity extends Identity {
  publicKey: ArrayBuffer // x-coordinate
  rawId: ArrayBuffer
  cosePublicKey: ArrayBuffer

  constructor(cosePublicKey: ArrayBuffer, rawId: ArrayBuffer) {
    super()
    this.cosePublicKey = cosePublicKey
    this.publicKey = this.getPublicKeyFromCoseKey(cosePublicKey)
    this.rawId = rawId
  }

  static decode(publicKey: ArrayBuffer) {
    return cbor.decodeAllSync(publicKey)
  }

  private getPublicKeyFromCoseKey(cosePublicKey: ArrayBuffer): ArrayBuffer {
    const decoded = cbor.decodeFirstSync(cosePublicKey)
    return decoded.get(-2)
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

  async sign(_: ArrayBuffer): Promise<ArrayBuffer> {
    return new TextEncoder().encode("webauthn")
  }

  async verify(_: ArrayBuffer): Promise<boolean> {
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

  async getUnprotectedHeader(data: ArrayBuffer): Promise<Map<string, any>> {
    const digest = await window.crypto.subtle.digest("SHA-512", data)
    const cred = await WebAuthnIdentity.getCredential(this.rawId, digest)
    const response = cred.response as AuthenticatorAssertionResponse
    const m = new Map()
    m.set("webauthn", true)
    m.set("authData", response.authenticatorData)
    m.set("clientData", Buffer.from(response.clientDataJSON).toString())
    m.set("signature", response.signature)
    return m
  }

  getCoseKey(): CoseKey {
    let decoded = cbor.decode(this.cosePublicKey)
    decoded.set(4, [2])
    return new CoseKey(decoded)
  }

  toJson(): { rawId: string; cosePublicKey: ArrayBuffer } {
    return {
      rawId: Buffer.from(this.rawId).toString("base64"),
      cosePublicKey: this.cosePublicKey,
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
  const cosePublicKey = authData.slice(55 + credentialIdLength)
  // const publicKeyObject = cbor.decodeFirstSync(cosePublicKey)
  return cosePublicKey
}
