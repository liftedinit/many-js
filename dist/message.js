import cbor from "cbor";
import { v4 as uuidv4 } from "uuid";
import { calculateKid, encodeEnvelope, getPayload } from "./cose";
import * as identity from "./identity";
const ANONYMOUS = Buffer.from([0x00]);
export function encode(message, keys = null) {
    const publicKey = keys ? keys.publicKey : ANONYMOUS;
    const payload = makePayload(message, publicKey);
    const envelope = encodeEnvelope(payload, keys);
    return envelope;
}
export function decode(cbor) {
    const payload = getPayload(cbor);
    return payload.value.data;
}
function makePayload({ to, from, method, data, version, timestamp, id }, publicKey) {
    if (!method) {
        throw new Error("Property 'method' is required.");
    }
    const payload = {
        to: to ? to : identity.toString(),
        from: from ? from : new cbor.Tagged(10000, calculateKid(publicKey)),
        method,
        data: cbor.encode(data ? JSON.parse(data, reviver) : new ArrayBuffer(0)),
        version: version ? version : 1,
        timestamp: new cbor.Tagged(1, timestamp ? timestamp : Math.floor(Date.now() / 1000)),
        id: id ? id : uuidv4(),
    };
    return payload;
}
function reviver(key, value) {
    switch (true) {
        case typeof value === "string" && /^\d+n$/.test(value): // "1000n"
            return BigInt(value.slice(0, -1));
        default:
            return value;
    }
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
