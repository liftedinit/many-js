import cbor from "cbor"
import { CoseKey, EMPTY } from "../../message/cose"
import { Address } from "../address"
import { PublicKeyIdentity } from "../types"
const sha512 = require("js-sha512")

const CHALLENGE_BUFFER = new TextEncoder().encode("lifted")
const ONE_MINUTE = 60000

export class WebAuthnIdentity extends PublicKeyIdentity {
  publicKey: ArrayBuffer
  rawId: ArrayBuffer
  cosePublicKey: ArrayBuffer

  constructor(cosePublicKey: ArrayBuffer, rawId: ArrayBuffer) {
    super()
    this.cosePublicKey = cosePublicKey
    this.publicKey = WebAuthnIdentity.getPublicKeyFromCoseKey(cosePublicKey)
    this.rawId = rawId
  }

  async getAddress(): Promise<Address> {
    return this.getCoseKey().toAddress()
  }

  static getPublicKeyFromCoseKey(cosePublicKey: ArrayBuffer): ArrayBuffer {
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
    const cosePublicKey = getCosePublicKey(attestationObj.authData)
    return new WebAuthnIdentity(cosePublicKey, publicKeyCredential.rawId)
  }

  async sign(): Promise<ArrayBuffer> {
    return EMPTY
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
    cborMessageContent: ArrayBuffer,
    cborProtectedHeader: ArrayBuffer,
  ): Promise<Map<string, unknown>> {
    const c = new Map()
    c.set(0, cborProtectedHeader)
    c.set(
      1,
      Buffer.from(sha512.arrayBuffer(cborMessageContent)).toString("base64"),
    )
    const challenge = cbor.encode(c)
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
    decoded.set(4, [2]) // key_ops: [verify]
    return new CoseKey(decoded)
  }

  toJson(): { rawId: string; cosePublicKey: ArrayBuffer } {
    return {
      rawId: Buffer.from(this.rawId).toString("base64"),
      cosePublicKey: this.cosePublicKey,
    }
  }
}

export async function createPublicKeyCredential(challenge = CHALLENGE_BUFFER) {
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
      // {
      //   // EdDSA	-8
      //   type: "public-key",
      //   alg: -8,
      // },
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

function getCosePublicKey(authData: ArrayBuffer): ArrayBuffer {
  const dataView = new DataView(new ArrayBuffer(2))
  const idLenBytes = authData.slice(53, 55)
  // @ts-ignore
  idLenBytes.forEach((value, index) => dataView.setUint8(index, value))
  const credentialIdLength = dataView.getUint16(0)
  const cosePublicKey = authData.slice(55 + credentialIdLength)
  return cosePublicKey
}
