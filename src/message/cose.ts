import cbor from "cbor";
import { pki } from "node-forge";
import { sha3_224 } from "js-sha3";
const ed25519 = pki.ed25519;

import { Identity } from "../identity";
import { Key, KeyPair } from "../keys";
import { OmniError, SerializedOmniError } from "./error";
import { ManyMessage, Payload } from "../message";
import { CborData, CborMap, tag } from "./cbor";

const EMPTY = Buffer.alloc(0);
const ANONYMOUS = Buffer.from([0x00]);

export class CoseMessage {
  protectedHeader: CborMap;
  unprotectedHeader: CborMap;
  content: CborMap;
  signature: Buffer;

  constructor(
    protectedHeader: CborMap,
    unprotectedHeader: CborMap,
    content: CborMap,
    signature: Buffer
  ) {
    this.protectedHeader = protectedHeader;
    this.unprotectedHeader = unprotectedHeader;
    this.content = content;
    this.signature = signature;
  }

  static fromCborData(data: CborData): CoseMessage {
    const cose = cbor.decodeFirstSync(data, { tags: decoders }).value;
    const protectedHeader = cbor.decodeFirstSync(cose[0]).value;
    const unprotectedHeader = cose[1];
    const content = cbor.decodeFirstSync(cose[2]).value;
    const signature = cose[4];

    // const payload: Map<number, any> = cbor.decodeFirstSync(cose[2]).value;
    //
    // // If it's an error, throw it.
    // const body = payload.get(4);
    // if (typeof body == "object" && !Buffer.isBuffer(body)) {
    //   throw new OmniError(mapToObject(body) as SerializedOmniError);
    // }
    //
    // // Decode the body part of the response.
    // // TODO: this is opaque blob and networks might return non-CBOR data here, so
    // // careful.
    // payload.set(4, mapToObject(cbor.decodeFirstSync(body, { tags: decoders })));
    return new CoseMessage(
      protectedHeader,
      unprotectedHeader,
      content,
      signature
    );
  }

  static fromManyMessage(message: ManyMessage, keys?: KeyPair): CoseMessage {
    const protectedHeader = this.getProtectedHeader(
      keys ? keys.publicKey : EMPTY
    );
    const unprotectedHeader = this.getUnprotectedHeader();
    const content = message.content;
    const signature = keys
      ? this.getSignature(protectedHeader, content, keys.privateKey)
      : EMPTY;
    return new CoseMessage(
      protectedHeader,
      unprotectedHeader,
      content,
      signature
    );
  }

  private static getProtectedHeader(publicKey: Key): CborMap {
    const coseKey = new CoseKey(publicKey);
    const protectedHeader = new Map();
    protectedHeader.set(1, -8); // alg: "Ed25519"
    protectedHeader.set(4, coseKey.keyId); // kid: kid
    protectedHeader.set("keyset", coseKey.toCborData());
    return protectedHeader;
  }

  private static getUnprotectedHeader(): CborMap {
    return new Map();
  }

  private static getSignature(
    protectedHeader: CborMap,
    content: CborMap,
    privateKey: Key
  ): Buffer {
    const p = cbor.encodeCanonical(protectedHeader);
    const payload = cbor.encode(tag(10001, content));
    const message = cbor.encodeCanonical(["Signature1", p, EMPTY, payload]);
    return Buffer.from(ed25519.sign({ message, privateKey }));
  }

  toCborData(): CborData {
    const p = cbor.encodeCanonical(this.protectedHeader);
    const u = this.unprotectedHeader;
    const payload = cbor.encode(tag(10001, this.content));
    let sig = this.signature;
    return cbor.encodeCanonical(new cbor.Tagged(18, [p, u, payload, sig]));
  }
}

export class CoseKey {
  key: CborMap;
  keyId: CborData;
  private common: CborMap;

  constructor(publicKey: Key) {
    this.common = this.getCommon(publicKey);
    this.keyId = this.getKeyId();
    this.key = this.getKey();
  }

  private getCommon(publicKey: Key) {
    const common = new Map();
    common.set(1, 1); // kty: OKP
    common.set(3, -8); // alg: EdDSA
    common.set(-1, 6); // crv: Ed25519
    common.set(4, [2]); // key_ops: [verify]
    common.set(-2, publicKey); // x: publicKey
    return common;
  }

  private getKeyId() {
    const keyId = new Map(this.common);
    const pk = "01" + sha3_224(cbor.encodeCanonical(keyId));
    return Buffer.from(pk, "hex");
  }

  private getKey() {
    const key = new Map(this.common);
    key.set(2, this.keyId); // kid: Key ID
    return key;
  }

  toCborData(): CborData {
    return cbor.encodeCanonical([this.key]);
  }

  toIdentity(): Identity {
    return new Identity(this.keyId);
  }
}

// --------------------------------------------------------------------------------

const EMPTY_BUFFER = new ArrayBuffer(0);

export function encodeEnvelope(payload: Payload, keys?: KeyPair) {
  const publicKey = keys ? keys.publicKey : ANONYMOUS;
  const p = encodeProtectedHeader(publicKey);
  const u = encodeUnprotectedHeader();
  const encodedPayload = cbor.encode(new cbor.Tagged(10001, payload));
  const sig = keys
    ? signStructure(p, encodedPayload, keys.privateKey)
    : EMPTY_BUFFER;
  return cbor.encodeCanonical(new cbor.Tagged(18, [p, u, encodedPayload, sig]));
}

function encodeProtectedHeader(publicKey: Key) {
  const protectedHeader = new Map();
  protectedHeader.set(1, -8); // alg: "Ed25519"
  protectedHeader.set(4, calculateKid(publicKey)); // kid: kid
  protectedHeader.set("keyset", encodeCoseKey(publicKey));
  const p = cbor.encodeCanonical(protectedHeader);
  return p;
}

function encodeUnprotectedHeader() {
  const unprotectedHeader = new Map();
  return unprotectedHeader;
}

export function encodeCoseKey(publicKey: Key) {
  const coseKey = new Map();
  coseKey.set(1, 1); // kty: OKP
  coseKey.set(3, -8); // alg: EdDSA
  coseKey.set(-1, 6); // crv: Ed25519
  coseKey.set(4, [2]); // key_ops: [verify]
  coseKey.set(2, calculateKid(publicKey)); // kid: kid
  coseKey.set(-2, publicKey); // x: publicKey
  return cbor.encodeCanonical([coseKey]);
}

function calculateKid(publicKey: Key) {
  if (Buffer.compare(publicKey, ANONYMOUS) === 0) {
    return ANONYMOUS;
  }
  const kid = new Map();
  kid.set(1, 1);
  kid.set(3, -8);
  kid.set(-1, 6);
  kid.set(4, [2]);
  kid.set(-2, publicKey);
  const pk = "01" + sha3_224(cbor.encodeCanonical(kid));
  return Buffer.from(pk, "hex");
}

export const toIdentity = calculateKid;

function signStructure(p: Buffer, payload: Buffer, privateKey: Key) {
  const message = cbor.encodeCanonical([
    "Signature1",
    p,
    EMPTY_BUFFER,
    payload,
  ]);
  const sig = ed25519.sign({ message, privateKey });
  return Buffer.from(sig);
}

// Add a decoder for tag 10000 (Identity) to cbor
const decoders = {
  10000: (x: Uint8Array) => new Identity(Buffer.from(x)),
};

function mapToObject(m?: Map<any, any>): Object | null {
  return m
    ? Array.from(m).reduce(
        (acc, [key, value]) => Object.assign(acc, { [key]: value }),
        {}
      )
    : null;
}

export function getPayload(buffer: Buffer): object | null {
  const cose = cbor.decodeFirstSync(buffer, { tags: decoders }).value;
  const payload: Map<number, any> = cbor.decodeFirstSync(cose[2]).value;

  // If it's an error, throw it.
  const body = payload.get(4);
  if (typeof body == "object" && !Buffer.isBuffer(body)) {
    throw new OmniError(mapToObject(body) as SerializedOmniError);
  }

  // Decode the body part of the response.
  // TODO: this is opaque blob and networks might return non-CBOR data here, so
  // careful.
  payload.set(4, mapToObject(cbor.decodeFirstSync(body, { tags: decoders })));

  // Transform it into an object for simplicity.
  return mapToObject(payload);
}
