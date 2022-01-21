/// <reference types="node" />
import { Key, KeyPair } from "./keys";
import { Payload } from "./message";
export declare function encodeEnvelope(payload: Payload, keys?: KeyPair): Buffer;
export declare function encodeCoseKey(publicKey: Key): Buffer;
declare function calculateKid(publicKey: Key): Buffer;
export declare const toIdentity: typeof calculateKid;
interface SerializedOmniError {
    "0"?: number;
    "1"?: string;
    "2"?: {
        [field: string]: string;
    };
}
export declare class OmniError extends Error {
    code: Number;
    fields: {
        [field: string]: string;
    };
    constructor(error: SerializedOmniError);
}
export declare function getPayload(buffer: Buffer): object | null;
export {};
