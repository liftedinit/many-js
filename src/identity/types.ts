import { CoseKey } from "../message/cose"

export interface Signer {
  sign(data: ArrayBuffer): Promise<ArrayBuffer | null>
}

export interface Verifier {
  verify(data: ArrayBuffer): Promise<boolean>
}

export abstract class Identity implements Signer, Verifier {
  abstract publicKey: ArrayBuffer
  abstract toJson(): unknown
  abstract sign(data: ArrayBuffer): Promise<ArrayBuffer | null>
  abstract verify(data: ArrayBuffer): Promise<boolean>
  abstract getCoseKey(): CoseKey
  async getUnprotectedHeader(_: ArrayBuffer): Promise<Map<string, any>> {
    return new Map()
  }
}

export abstract class KeyPairIdentity extends Identity {
  abstract privateKey: ArrayBuffer
}
