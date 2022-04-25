export interface Signer {
  sign(data: ArrayBuffer): Promise<ArrayBuffer>
}

export interface Verifier {
  verify(data: ArrayBuffer): Promise<boolean>
}

export abstract class Identity implements Signer, Verifier {
  abstract publicKey: ArrayBuffer
  abstract toJson(): unknown
  abstract sign(data: ArrayBuffer): Promise<ArrayBuffer>
  abstract verify(data: ArrayBuffer): Promise<boolean>
}

export abstract class KeyPairIdentity extends Identity {
  abstract privateKey: ArrayBuffer
}
