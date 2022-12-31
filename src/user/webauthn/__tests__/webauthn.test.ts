import { Identifier } from "../../identifier"
import { WebAuthn } from "../webauthn"
import { mockPublicKeyCredential } from "./data"

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
      const webauthn = new WebAuthn(mockPublicKeyCredential)

      expect(webauthn instanceof WebAuthn).toBe(true)
      expect(webauthn instanceof Identifier).toBe(true)
    })
    it("should set the credential (and public key)", () => {
      const webauthn = new WebAuthn(mockPublicKeyCredential)

      expect(webauthn.credential).toBeDefined()
      expect(webauthn.publicKey).toBeDefined()
    })
  })
})
