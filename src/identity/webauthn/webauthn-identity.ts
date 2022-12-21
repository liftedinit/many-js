import cbor from "cbor"
import { ONE_MINUTE } from "../../const"
import { CoseKey, EMPTY } from "../../message/encoding"
import { makeRandomBytes } from "../../utils"
import { Address } from "../address"
import { PublicKeyIdentity } from "../types"
const sha512 = require("js-sha512")

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
    checkBrowserSupport()
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
    // This value ends up in the signature COSE field, but we don't
    // use it for WebAuthn verification, so we simply set it to
    // EMPTY.
    return EMPTY
  }

  async verify(_: ArrayBuffer): Promise<boolean> {
    throw new Error("Method not implemented.")
  }

  static async getCredential(
    credentialId: ArrayBuffer,
    challenge: Uint8Array = makeRandomBytes(),
  ): Promise<PublicKeyCredential> {
    checkBrowserSupport()
    validateChallenge(challenge)
    let credential = (await window.navigator.credentials.get({
      publicKey: {
        challenge,
        timeout: ONE_MINUTE,
        userVerification: "preferred",
        allowCredentials: [
          {
            transports: ["nfc", "usb", "ble"],
            id: credentialId,
            type: "public-key",
          },
        ],
      },
    })) as PublicKeyCredential
    return credential
  }

  async getProtectedHeader(): Promise<Map<string, unknown>> {
    return new Map().set("webauthn", true)
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

  toJSON(): { dataType: string; rawId: string; cosePublicKey: ArrayBuffer } {
    return {
      dataType: this.constructor.name,
      rawId: Buffer.from(this.rawId).toString("base64"),
      cosePublicKey: this.cosePublicKey,
    }
  }
}

async function createPublicKeyCredential(challenge = makeRandomBytes()) {
  validateChallenge(challenge)
  const publicKey: PublicKeyCredentialCreationOptions = {
    challenge,

    timeout: ONE_MINUTE,

    rp: {
      name: "lifted",
    },

    user: {
      id: makeRandomBytes(),
      name: "Lifted",
      displayName: "Lifted",
    },

    attestation: "direct",

    authenticatorSelection: {
      authenticatorAttachment: "cross-platform",
      userVerification: "discouraged",
    },

    pubKeyCredParams: [
      /**
       * we only use this algo because the major browsers (chrome, firefox, safari, brave, edge) support this.
       * for example, if we create a credential with eddsa algo on chrome, we wouldnt be able to use it from firefox
       * because it doesn't support this algo.
       */
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

function checkBrowserSupport() {
  if (!window.PublicKeyCredential) {
    throw new Error("Webauthn not supported")
  }
}

function validateChallenge(challenge: Uint8Array) {
  if (
    !(challenge?.buffer instanceof ArrayBuffer) ||
    !challenge?.BYTES_PER_ELEMENT ||
    challenge?.byteLength < 32
  ) {
    throw new Error("invalid challenge")
  }
}
