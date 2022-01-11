/// <reference types="node" />
import { KeyPair } from "./keys";
export declare type Cbor = Buffer;
export interface Message {
    data?: any;
    from?: string;
    id?: number | string;
    method: string;
    timestamp?: number;
    to?: string;
    version?: number;
}
export declare type Payload = Map<number, any>;
export interface Cose {
    tag: number;
    value: {
        4: any;
    };
    err: number[];
}
export declare function encode(message: Message, keys?: KeyPair): Cbor;
export declare function decode(cbor: Cbor): any;
export declare function toJSON(buffer: Cbor): string;
