import { Cbor } from "./message";
export declare type Key = Uint8Array;
export interface KeyPair {
    publicKey: Key;
    privateKey: Key;
}
export declare type Identity = KeyPair | null;
export declare function getSeedWords(): string;
export declare function fromSeedWords(mnemonic: string): Identity;
export declare function fromPem(pem: string): Identity;
export declare function toString(keys?: Identity): string;
export declare function toHex(keys?: Identity): string;
export declare function toCoseKey(keys?: Identity): Cbor;
