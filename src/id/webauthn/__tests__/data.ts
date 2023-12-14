import { encodeCanonical as encode } from "cbor-web";
import { makeRandomBytes, strToBytes } from "../../../shared/utils";

export const mockPublicKeyCredential: PublicKeyCredential = {
  type: "public-key",
  id: "LYsvp0_EeXaLbGjewiq27w-c7m4",
  rawId: strToBytes("2d8b2fa74fc479768b6c68dec22ab6ef0f9cee6e"),
  response: {
    clientDataJSON: strToBytes("clientDataJSON"),
    attestationObject: encode({
      fmt: "none",
      attStmt: {},
      authData: new Uint8Array([
        ...new Uint8Array(54), // rpIdHash, flags, signCount, aaguid
        ...new Uint8Array([0x28]), // Length of credentialId
        ...strToBytes("2d8b2fa74fc479768b6c68dec22ab6ef0f9cee6e"),
        ...encode(
          new Map<number, any>([
            [1, 2], // kty: "EC"
            [1, -7], // alg: "ECDSA_w_SHA256"
            [-1, 1], // crv: P-256
            [-2, strToBytes("ouqbwc6IrqM4kF2fhP+jJIdAWNaM5kSxGWSSSyv80h8=")], // x
            [-3, strToBytes("Iu6OhNpgyU3yxeTuR31aat6qC5SvhkLTTnV5X0a/iPk=")], // y
          ]),
        ),
      ]),
    }),
    signature: makeRandomBytes(),
  } as AuthenticatorResponse,
  // @ts-ignore
  getClientExtensionResults: () => { },
};

export function makeMockPublicKeyCredential(
  options: CredentialRequestOptions,
): PublicKeyCredential {
  const signature = options.publicKey?.challenge;
  return {
    ...mockPublicKeyCredential,
    response: {
      ...mockPublicKeyCredential.response,
      signature,
    } as AuthenticatorResponse,
  };
}
