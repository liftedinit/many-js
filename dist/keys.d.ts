export declare type Key = Uint8Array;
export declare type KeyPair = {
    privateKey: Key;
    publicKey: Key;
};
export declare function getSeedWords(): string;
export declare function fromSeedWords(mnemonic: string): KeyPair;
export declare function fromPem(pem: string): KeyPair;
