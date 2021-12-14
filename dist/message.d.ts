/// <reference types="node" />
import Tagged from "cbor/types/lib/tagged";
import { Identity as ID } from "./identity";
export declare type Cbor = Buffer;
export interface Message {
    data?: string;
    from?: string;
    id?: number | string;
    method: string;
    timestamp?: number;
    to?: string;
    version?: number;
}
export interface Payload {
    data: Cbor;
    from: Tagged | string;
    id: number | string;
    method: string;
    timestamp: Tagged;
    to: string;
    version: number;
}
export interface Cose {
    tag: number;
    value: {
        data: any;
    };
    err: number[];
}
export declare function encode(message: Message, keys?: ID): Cbor;
export declare function decode(cbor: Cbor): any;
export declare function toJSON(buffer: Cbor): string;
