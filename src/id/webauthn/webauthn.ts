import cbor from "cbor";
import { CoseKey } from "../../message/encoding";
import { makeRandomBytes } from "../../shared/utils";
import { Identifier } from "../identifier";

export class WebAuthn extends Identifier {
  readonly publicKey: Uint8Array;

  constructor(readonly credential: PublicKeyCredential) {
    super();
    this.publicKey = this.toCoseKey().publicKey;
  }

  async sign(data: ArrayBuffer): Promise<ArrayBuffer> {
    let credential = await global.navigator.credentials.get({
      publicKey: {
        challenge: data,
        timeout: 1000 * 60, // 1 minute
        userVerification: "preferred",
        allowCredentials: [
          {
            transports: ["nfc", "usb", "ble"],
            id: this.credential.rawId,
            type: "public-key",
          },
        ],
      },
    });
    if (credential) {
      const { response } = credential as PublicKeyCredential;
      const { signature } = response as AuthenticatorAssertionResponse;
      return signature;
    }
    throw new Error(
      `Could not sign data: ${Buffer.from(data).toString("hex")}`,
    );
  }

  toCoseKey(): CoseKey {
    const { attestationObject } = this.credential
      .response as AuthenticatorAttestationResponse;
    const { authData } = cbor.decodeFirstSync(attestationObject);

    const dataView = new DataView(new ArrayBuffer(2));
    const idLenBytes = authData.slice(53, 55);
    // @ts-ignore
    idLenBytes.forEach((value, index) => dataView.setUint8(index, value));
    const credentialIdLength = dataView.getUint16(0);
    const publicKeyBytes = authData.slice(55 + credentialIdLength);

    return new CoseKey(cbor.decodeFirstSync(publicKeyBytes));
  }

  static async create(): Promise<WebAuthn> {
    const credential = await global.navigator.credentials.create({
      publicKey: {
        challenge: makeRandomBytes(),
        timeout: 1000 * 60, // 1 minute
        rp: { name: "lifted" },
        user: { id: makeRandomBytes(), name: "Lifted", displayName: "Lifted" },
        attestation: "direct",
        authenticatorSelection: {
          authenticatorAttachment: "cross-platform",
          userVerification: "discouraged",
        },
        pubKeyCredParams: [
          {
            type: "public-key",
            alg: -7, // ES256 (ECDSA w/ SHA-256)
          },
        ],
      },
    });
    if (credential) {
      return new WebAuthn(credential as PublicKeyCredential);
    }
    throw new Error("Could not create WebAuthn identifier");
  }

  static async get(id: ArrayBuffer): Promise<WebAuthn> {
    let credential = await global.navigator.credentials.get({
      publicKey: {
        challenge: makeRandomBytes(),
        timeout: 1000 * 60, // 1 minute
        userVerification: "preferred",
        allowCredentials: [
          {
            transports: ["nfc", "usb", "ble"],
            id,
            type: "public-key",
          },
        ],
      },
    });
    if (credential) {
      return new WebAuthn(credential as PublicKeyCredential);
    }
    throw new Error("Could not get WebAuthn identifier");
  }

  static fromString(_: string): WebAuthn {
    throw new Error("Cannot create a WebAuthn identifer from a string");
  }
}
