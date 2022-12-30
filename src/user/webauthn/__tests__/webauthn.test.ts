import { Identifier } from "../../identifier"
import { WebAuthn } from "../webauthn"

const credential = {
  rawId: new ArrayBuffer(32),
  response: {
    authenticatorData: "mockAuthData",
    clientDataJSON: Buffer.from("clientDataJSON"),
    signature: "mockSignature",
  } as AuthenticatorResponse,
} as PublicKeyCredential

describe("WebAuthn", () => {
  describe("constructor", () => {
    it("should return a webauthn identifier", async () => {
      const webauthn = new WebAuthn(new Uint8Array(1), credential)

      expect(webauthn instanceof WebAuthn).toBe(true)
      expect(webauthn instanceof Identifier).toBe(true)
    })
    it("should set the public key and credential", () => {
      const webauthn = new WebAuthn(new Uint8Array(1), credential)

      expect(webauthn.publicKey).toBeDefined()
      expect(webauthn.credential).toBeDefined()
    })
    // it("should throw on too short a private key", () => {
    //   expect(() => new KeyPair(new Uint8Array(1), new Uint8Array(2))).toThrow()
    // })
  })
})
