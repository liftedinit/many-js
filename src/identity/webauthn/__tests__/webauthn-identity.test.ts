import cbor from "cbor"
import { tag } from "../../../message/cbor"
import { CoseKey } from "../../../message/cose"
import * as WebAuthnIdentityModule from "../webauthn-identity"

const { WebAuthnIdentity } = WebAuthnIdentityModule

describe("WebAuthnIdentity", () => {
  it("should have static methods", () => {
    expect(typeof WebAuthnIdentity.create).toBe("function")
    expect(typeof WebAuthnIdentity.getCredential).toBe("function")
  })
  it("getCoseKey()", () => {
    const publicKeyMap = new Map<number, number | ArrayBuffer>([
      [1, 1],
      [3, -8],
      [-1, 6],
      [-2, new Uint8Array(32)],
    ])
    const identity = setup(publicKeyMap)
    const coseKey = identity.getCoseKey()
    expect(coseKey instanceof CoseKey).toBe(true)
  })
  it("getUnprotectedHeader()", async () => {
    const getCredentialMock = jest
      .spyOn(WebAuthnIdentity, "getCredential")
      .mockImplementationOnce(async () => {
        return {
          rawId: new ArrayBuffer(32),
          response: {
            authenticatorData: "mockAuthData",
            clientDataJSON: Buffer.from("clientDataJSON"),
            signature: "mockSignature",
          } as AuthenticatorResponse,
        } as PublicKeyCredential
      })
    const cborMessageContent = cbor.encode(
      tag(
        10001,
        new Map([
          [1, "maexhjte7fss6cqg4hznyyqnn65pxdqrqbvjz6ocf7tl57zawf"],
          [3, "ledger.info"],
        ]),
      ),
    )
    const cborProtectedHeader = cbor.encode(
      new Map([
        [1, "alg"],
        [4, "kid"],
      ]),
    )
    const identity = setup()
    const unprotectedHeader = await identity.getUnprotectedHeader(
      cborMessageContent,
      cborProtectedHeader,
    )
    expect(getCredentialMock).toHaveBeenCalledTimes(1)
    expect(unprotectedHeader.get("authData")).toBe("mockAuthData")
    expect(unprotectedHeader.get("clientData")).toBe("clientDataJSON")
    expect(unprotectedHeader.get("signature")).toBe("mockSignature")
  })
  it("getProtectedHeader()", async function () {
    const identity = setup()
    const protectedHeader = await identity.getProtectedHeader()
    expect(protectedHeader.get("webauthn")).toBe(true)
  })
})

function setup(publicKeyMap?: Map<number, number | ArrayBuffer>) {
  const publicKey = Buffer.from(new ArrayBuffer(32))
  const cosePublicKey = cbor.encode(publicKeyMap ?? new Map([[-2, publicKey]]))
  const rawId = new ArrayBuffer(32)
  return new WebAuthnIdentity(cosePublicKey, rawId)
}
