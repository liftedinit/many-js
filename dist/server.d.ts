import { Identity as ID } from "./identity";
import { Cbor, Message } from "./message";
export declare function sendEncoded(url: string, cbor: Cbor): Promise<Cbor>;
export declare function send(url: string, message: Message, keys?: ID): Promise<any>;
export declare function connect(url: string): {
    endpoints: () => Promise<any>;
    ledger_info: () => Promise<any>;
    ledger_balance: (symbols: string[], keys: ID) => Promise<any>;
};
