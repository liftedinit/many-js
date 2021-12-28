/// <reference types="node" />
import { Identity as ID } from "./identity";
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
export declare function encode(message: Message, keys?: ID): Cbor;
export declare function decode(cbor: Cbor): any;
export declare function toJSON(buffer: Cbor): string;
