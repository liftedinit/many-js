export interface Signer {
  sign(data: ArrayBuffer): Promise<ArrayBuffer>
}

export interface Verifier {
  verify(data: ArrayBuffer): Promise<boolean>
}

export abstract class UserIdentity implements Signer, Verifier {
  abstract publicKey: ArrayBuffer
  abstract sign(data: ArrayBuffer): Promise<ArrayBuffer>
  abstract verify(data: ArrayBuffer): Promise<boolean>
}

export abstract class KeyPairUserIdentity extends UserIdentity {
  abstract privateKey: ArrayBuffer
}
