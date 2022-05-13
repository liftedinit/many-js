import { CoseKey } from "../message/cose"
import { Address } from "./address"

export interface Signer {
  sign(
    data: ArrayBuffer,
    unprotectedHeader?: Map<string, unknown>,
  ): Promise<ArrayBuffer>
}

export interface Verifier {
  verify(data: ArrayBuffer): Promise<boolean>
}

export abstract class Identity implements Signer, Verifier {
  abstract getAddress(): Promise<Address>
  abstract toJson(): unknown
  abstract sign(
    data: ArrayBuffer,
    unprotectedHeader: Map<string, unknown>,
  ): Promise<ArrayBuffer>
  abstract verify(data: ArrayBuffer): Promise<boolean>
  async getUnprotectedHeader(
    cborMessageContent: ArrayBuffer,
    cborProtectedHeader: ArrayBuffer,
  ): Promise<Map<string, unknown>> {
    return new Map()
  }
}

export abstract class PublicKeyIdentity extends Identity {
  abstract publicKey: ArrayBuffer
  abstract getCoseKey(): CoseKey
}

export abstract class PrivateKeyIdentity extends PublicKeyIdentity {
  abstract privateKey: ArrayBuffer
}
