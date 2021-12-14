/// <reference types="node" />
import { Identity as ID, Key } from "./identity";
import { Payload } from "./message";
export declare function encodeEnvelope(payload: Payload, keys: ID): Buffer;
export declare function calculateKid(publicKey: Key): Buffer;
export declare function getPayload(buffer: Buffer): object;
