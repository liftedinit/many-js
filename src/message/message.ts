import cbor from "cbor";
import { Anonymous, Identifier, KeyPair, WebAuthn } from "../id";
import { CborData, CborMap, CoseSign1 } from "./encoding";
const sha512 = require("js-sha512");
import { toString } from "../shared/utils";

export abstract class Message {
  constructor(public content: CborMap) {}

  async toCoseSign1(id: Identifier): Promise<CoseSign1> {
    const protectedHeader = this.getProtectedHeader(id);
    const cborProtectedHeader = cbor.encodeCanonical(protectedHeader);

    const payload = this.content;
    const cborPayload = cbor.encode(new cbor.Tagged(10001, payload));

    const toBeSigned = cbor.encodeCanonical([
      "Signature1",
      cborProtectedHeader,
      new Uint8Array(),
      cborPayload,
    ]);

    const unprotectedHeader = await this.getUnprotectedHeader(
      id,
      cborProtectedHeader,
      toBeSigned,
    );

    const signature = await this.getSignature(id, toBeSigned);

    return new CoseSign1(
      protectedHeader,
      unprotectedHeader,
      payload,
      signature,
    );
  }

  private getProtectedHeader(id: Identifier): CborMap {
    const protectedHeader = new Map();

    // Add the CoseKey if the identifier supports it
    if (id instanceof KeyPair || id instanceof WebAuthn) {
      const coseKey = id.toCoseKey();
      protectedHeader.set(1, coseKey.key.get(3)); // alg
      protectedHeader.set(4, coseKey.keyId); // kid: kid
      protectedHeader.set("keyset", coseKey.toCborData());
    }

    // Note if we're using WebAuthn
    if (id instanceof WebAuthn) {
      protectedHeader.set("webauthn", true);
    }
    return protectedHeader;
  }

  private async getUnprotectedHeader(
    id: Identifier,
    cborProtectedHeader: CborData,
    toBeSigned: CborData,
  ): Promise<CborMap> {
    const unprotectedHeader = new Map();

    // Special rules for WebAuthn because the signature goes here instead
    if (id instanceof WebAuthn) {
      const data = new Map<number, any>([
        [0, cborProtectedHeader],
        [
          1,
          btoa(
            String.fromCharCode(
              ...new Uint8Array(sha512.arrayBuffer(toBeSigned)),
            ),
          ),
        ],
      ]);
      const sig = await id.sign(cbor.encodeCanonical(data));
      const res = id.credential.response as AuthenticatorAssertionResponse;

      unprotectedHeader.set("authData", res.authenticatorData);
      unprotectedHeader.set(
        "clientData",
        toString(new Uint8Array(res.clientDataJSON)),
      );
      unprotectedHeader.set("signature", sig);
    }
    return unprotectedHeader;
  }

  private async getSignature(
    id: Identifier,
    toBeSigned: CborData,
  ): Promise<ArrayBuffer> {
    // Signature is the standard Cose structure, but only for KeyPair identifiers
    if (id instanceof KeyPair) {
      return await id.sign(toBeSigned);
    }
    return new Uint8Array();
  }

  async toCborData(id: Identifier = new Anonymous()) {
    return (await this.toCoseSign1(id)).toCborData();
  }

  abstract toJSON(): {};
}
