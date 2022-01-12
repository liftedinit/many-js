/// <reference types="node" />
import { Key } from "./keys";
export declare type Identity = Buffer;
export declare function fromBuffer(buffer: Uint8Array): Identity;
export declare function fromPublicKey(key: Key): Identity;
export declare function fromString(string: string): Identity;
export declare function toString(identity?: Identity): string;
export declare function fromHex(hex: string): Identity;
export declare function toHex(identity?: Identity): string;
