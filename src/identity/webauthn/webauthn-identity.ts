import cbor from "cbor"
import { CoseKey, EMPTY } from "../../message/cose"
import { Identity } from "../types"
const sha512 = require("js-sha512")

const CHALLENGE_BUFFER = new TextEncoder().encode("lifted")
const ONE_MINUTE = 60000

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
    return cbor.decodeFirstSync(publicKey)
  }

  private getPublicKeyFromCoseKey(cosePublicKey: ArrayBuffer): ArrayBuffer {
    const decoded = cbor.decodeFirstSync(cosePublicKey)
    return decoded.get(-2)
  }

  static async create(): Promise<WebAuthnIdentity> {
    const publicKeyCredential = await createPublicKeyCredential()
    const attestationResponse = publicKeyCredential?.response
    if (!(attestationResponse instanceof AuthenticatorAttestationResponse)) {
      throw new Error("Must be AuthenticatorAttestationResponse")
    }
    const attestationObj = cbor.decodeFirstSync(
      attestationResponse.attestationObject,
    )
    const publicKeyBytes = getPublicKeyBytesFromAuthData(
      attestationObj.authData,
    )
    return new WebAuthnIdentity(publicKeyBytes, publicKeyCredential.rawId)
  }

  async sign(
    _: ArrayBuffer,
    unprotectedHeader: Map<string, unknown>,
  ): Promise<ArrayBuffer> {
    return unprotectedHeader.get("signature") as ArrayBuffer
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
        timeout: ONE_MINUTE,
        userVerification: "discouraged",
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

  async getUnprotectedHeader(
    data: ArrayBuffer,
    cborProtectedHeader: ArrayBuffer,
  ): Promise<Map<string, unknown>> {
    const digest = sha512.arrayBuffer(data)
    const challenge = cbor.encodeCanonical([cborProtectedHeader, digest])
    const cred = await WebAuthnIdentity.getCredential(this.rawId, challenge)
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

async function createPublicKeyCredential(challenge = CHALLENGE_BUFFER) {
  const publicKey: PublicKeyCredentialCreationOptions = {
    challenge,

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
      userVerification: "discouraged",
    },

    pubKeyCredParams: [
      {
        // EdDSA	-8
        type: "public-key",
        alg: -8,
      },
      {
        // ES256	-7	ECDSA w/ SHA-256
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
  const cosePublicKey = authData.slice(55 + credentialIdLength)
  // const publicKeyObject = cbor.decodeFirstSync(cosePublicKey)
  return cosePublicKey
}
