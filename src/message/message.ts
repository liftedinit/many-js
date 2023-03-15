import cbor from "cbor";
import { Anonymous, Identifier, KeyPair, WebAuthn } from "../id";
import { CoseSign1 } from "./encoding";
const sha512 = require("js-sha512");

type CborMap = Map<number | string, any>;

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
      Buffer.alloc(0),
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
      protectedHeader.set("keyset", coseKey.toBuffer());
    }

    // Note if we're using WebAuthn
    if (id instanceof WebAuthn) {
      protectedHeader.set("webauthn", true);
    }
    return protectedHeader;
  }

  private async getUnprotectedHeader(
    id: Identifier,
    cborProtectedHeader: Buffer,
    toBeSigned: Buffer,
  ): Promise<CborMap> {
    const unprotectedHeader = new Map();

    // Special rules for WebAuthn because the signature goes here instead
    if (id instanceof WebAuthn) {
      const data = new Map<number, any>([
        [0, cborProtectedHeader],
        [1, Buffer.from(sha512.arrayBuffer(toBeSigned)).toString("base64")],
      ]);
      const sig = await id.sign(cbor.encodeCanonical(data));
      const res = id.credential.response as AuthenticatorAssertionResponse;

      unprotectedHeader.set("authData", res.authenticatorData);
      unprotectedHeader.set(
        "clientData",
        Buffer.from(res.clientDataJSON).toString(),
      );
      unprotectedHeader.set("signature", sig);
    }
    return unprotectedHeader;
  }

  private async getSignature(
    id: Identifier,
    toBeSigned: Buffer,
  ): Promise<ArrayBuffer> {
    // Signature is the standard Cose structure, but only for KeyPair identifiers
    if (id instanceof KeyPair) {
      return await id.sign(toBeSigned);
    }
    return Buffer.alloc(0);
  }

  async toBuffer(id: Identifier = new Anonymous()) {
    return (await this.toCoseSign1(id)).toBuffer();
  }

  abstract toJSON(): {};
}
