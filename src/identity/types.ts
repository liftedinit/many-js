import { CborMap } from "../message/cbor"
import { CoseKey } from "../message/cose"

export interface Signer {
  sign(
    data: ArrayBuffer,
    unprotectedHeader?: Map<string, unknown>,
  ): Promise<ArrayBuffer | null>
}

export interface Verifier {
  verify(data: ArrayBuffer): Promise<boolean>
}

export abstract class Identity implements Signer, Verifier {
  abstract publicKey: ArrayBuffer
  abstract toJson(): unknown
  abstract sign(
    data: ArrayBuffer,
    unprotectedHeader: Map<string, unknown>,
  ): Promise<ArrayBuffer | null>
  abstract verify(data: ArrayBuffer): Promise<boolean>
  abstract getCoseKey(): CoseKey
  async getUnprotectedHeader(
    cborMessageContent: ArrayBuffer,
    cborProtectedHeader: ArrayBuffer,
  ): Promise<Map<string, unknown>> {
    return new Map()
  }
}

export abstract class KeyPairIdentity extends Identity {
  abstract privateKey: ArrayBuffer
}
