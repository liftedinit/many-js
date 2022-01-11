import cbor from "cbor";
import { pki } from "node-forge";
import { sha3_224 } from "js-sha3";
const ANONYMOUS = Buffer.from([0x00]);
const EMPTY_BUFFER = new ArrayBuffer(0);
const ed25519 = pki.ed25519;
export function encodeEnvelope(payload, keys) {
    const publicKey = keys ? keys.publicKey : ANONYMOUS;
    const p = encodeProtectedHeader(publicKey);
    const u = encodeUnprotectedHeader(publicKey);
    const encodedPayload = cbor.encode(new cbor.Tagged(10001, payload));
    const sig = keys
        ? signStructure(p, encodedPayload, keys.privateKey)
        : EMPTY_BUFFER;
    return cbor.encodeCanonical(new cbor.Tagged(18, [p, u, encodedPayload, sig]));
}
function encodeProtectedHeader(publicKey) {
    const protectedHeader = new Map();
    protectedHeader.set(1, -8); // alg: "Ed25519"
    protectedHeader.set(4, calculateKid(publicKey)); // kid: kid
    protectedHeader.set("keyset", encodeCoseKey(publicKey));
    const p = cbor.encodeCanonical(protectedHeader);
    return p;
}
function encodeUnprotectedHeader(publicKey) {
    const unprotectedHeader = new Map();
    return unprotectedHeader;
}
export function encodeCoseKey(publicKey) {
    const coseKey = new Map();
    coseKey.set(1, 1); // kty: OKP
    coseKey.set(3, -8); // alg: EdDSA
    coseKey.set(-1, 6); // crv: Ed25519
    coseKey.set(4, [2]); // key_ops: [verify]
    coseKey.set(2, calculateKid(publicKey)); // kid: kid
    coseKey.set(-2, publicKey); // x: publicKey
    return cbor.encodeCanonical([coseKey]);
}
function calculateKid(publicKey) {
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
function signStructure(p, payload, privateKey) {
    const message = cbor.encodeCanonical([
        "Signature1",
        p,
        EMPTY_BUFFER,
        payload,
    ]);
    const sig = ed25519.sign({ message, privateKey });
    return Buffer.from(sig);
}
export function getPayload(buffer) {
    const cose = cbor.decodeFirstSync(buffer).value;
    const payload = cose[2];
    return decodeCbor(payload);
}
export function decodeCbor(candidate) {
    if (isBuffer(candidate)) {
        return decodeBuffer(candidate);
    }
    else if (isArray(candidate)) {
        return decodeArray(candidate);
    }
    else if (isMap(candidate)) {
        return decodeMap(candidate);
    }
    else if (isObject(candidate)) {
        return decodeObject(candidate);
    }
    return candidate;
}
function isBuffer(candidate) {
    return candidate instanceof Buffer;
}
function decodeBuffer(buffer) {
    try {
        return decodeCbor(cbor.decodeFirstSync(buffer)); // CBOR
    }
    catch (e) {
        return buffer; // Some other Buffer
    }
}
function isArray(candidate) {
    return Array.isArray(candidate);
}
function decodeArray(array) {
    return array.map((item) => decodeCbor(item));
}
function isMap(candidate) {
    return candidate instanceof Map;
}
function decodeMap(map) {
    return [...map.entries()].reduce((obj, [key, val]) => (Object.assign(Object.assign({}, obj), { [key]: decodeCbor(val) })), {});
}
function isObject(candidate) {
    return (typeof candidate === "object" &&
        !Array.isArray(candidate) &&
        candidate !== null);
}
function decodeObject(object) {
    return Object.entries(object).reduce((obj, [key, val]) => (Object.assign(Object.assign({}, obj), { [key]: decodeCbor(val) })), {});
}
