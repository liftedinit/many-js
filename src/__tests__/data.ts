import { Ed25519KeyPairIdentity } from "../identity"

export const SERVERS = {
  LEDGER: "http://127.0.0.1:8000",
  KEYVALUE: "http://127.0.0.1:8010",
}

export const ID1 = Ed25519KeyPairIdentity.fromPem(`
-----BEGIN PRIVATE KEY-----
MC4CAQAwBQYDK2VwBCIEIGgh+scXslP3zB4Jgkxtjf8vG60M9h4ZMjKg4RbxqWaG
-----END PRIVATE KEY-----
`)

export const ID_RND = () =>
  Ed25519KeyPairIdentity.fromMnemonic(Ed25519KeyPairIdentity.getMnemonic())
