import { KeyPair } from "../id";

export const SERVERS = {
  LEDGER: "http://127.0.0.1:8000",
  KEYVALUE: "http://127.0.0.1:8010",
};

export const ID1 = KeyPair.fromPem(`
-----BEGIN PRIVATE KEY-----
MC4CAQAwBQYDK2VwBCIEIGgh+scXslP3zB4Jgkxtjf8vG60M9h4ZMjKg4RbxqWaG
-----END PRIVATE KEY-----
`);
