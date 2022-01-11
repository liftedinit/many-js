/// <reference types="node" />
import { Key, KeyPair } from "./keys";
import { Payload } from "./message";
export declare function encodeEnvelope(payload: Payload, keys?: KeyPair): Buffer;
export declare function encodeCoseKey(publicKey: Key): Buffer;
declare function calculateKid(publicKey: Key): Buffer;
export declare const toIdentity: typeof calculateKid;
export declare function getPayload(buffer: Buffer): object;
export declare function decodeCbor(candidate: any): object;
export {};
