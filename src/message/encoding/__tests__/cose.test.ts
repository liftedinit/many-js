import { pki } from "node-forge"
import { Message } from "../../message"
import { CoseMessage } from "../cose"
import { Ed25519KeyPairIdentity } from "../../../identity"
const ed25519 = pki.ed25519

describe("CoseMessage", () => {
  test("can make anonymous request", async () => {
    const anonymousMessage = Message.fromObject({ method: "info" })
    const coseMessage = await CoseMessage.fromMessage(anonymousMessage)

    expect(coseMessage.signature).toHaveLength(0)
  })

  test("can make signed request", async () => {
    const identity = Ed25519KeyPairIdentity.fromMnemonic(
      Ed25519KeyPairIdentity.getMnemonic(),
    )
    const signedMessage = Message.fromObject({ method: "info" })
    const coseMessage = await CoseMessage.fromMessage(signedMessage, identity)

    expect(coseMessage.signature).not.toHaveLength(0)
  })

  test("can serialize/deserialize CBOR", async () => {
    const request = Message.fromObject({ method: "info" })
    const coseMessage = await CoseMessage.fromMessage(request)
    const serialized = coseMessage.toCborData()
    const deserialized = CoseMessage.fromCborData(serialized)

    expect(deserialized.content).toStrictEqual(coseMessage.content)
  })
})

describe("CoseKey", () => {
  test.skip("fromPublicKey", () => {})
})
