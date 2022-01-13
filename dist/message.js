import cbor from "cbor";
import { encodeEnvelope, getPayload } from "./cose";
import * as identity from "./identity";
export function encode(message, keys) {
    const sender = keys ? identity.fromPublicKey(keys.publicKey) : undefined;
    const payload = makePayload(message, sender);
    const envelope = encodeEnvelope(payload, keys);
    return envelope;
}
export function decode(cbor) {
    const payload = getPayload(cbor);
    return payload ? payload["4"] : {};
}
function makePayload({ to, from, method, data, version, timestamp }, sender) {
    if (!method) {
        throw new Error("Property 'method' is required.");
    }
    const now = Math.floor(Date.now() / 1000);
    const payload = new Map();
    payload.set(0, version ? version : 1);
    payload.set(1, from ? from : identity.toString(sender));
    payload.set(2, to ? to : identity.toString()); // ANONYMOUS
    payload.set(3, method);
    payload.set(4, cbor.encode(data ? data : new ArrayBuffer(0)));
    payload.set(5, new cbor.Tagged(1, timestamp ? timestamp : now));
    return payload;
}
export function toJSON(buffer) {
    const cose = cbor.decodeAllSync(buffer);
    return JSON.stringify(cose, replacer, 2);
}
function replacer(key, value) {
    switch (true) {
        case (value === null || value === void 0 ? void 0 : value.type) === "Buffer": {
            // Cbor
            const buffer = Buffer.from(value.data);
            try {
                return cbor.decodeAllSync(buffer);
            }
            catch (e) {
                return buffer.toString("hex");
            }
        }
        case value instanceof Map: // Map()
            return Object.fromEntries(value.entries());
        case typeof value === "bigint": // BigInt()
            return parseInt(value.toString());
        case key === "hash": // { hash: [0,1,2] }
            return Buffer.from(value).toString("hex");
        default:
            return value;
    }
}
