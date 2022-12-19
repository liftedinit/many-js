# Users, Identifiers, and Addresses

A _User_ is an entity that interacts with the Many protocol by sending requests
and receiving responses. This entity might be a real person or a process running
inside or outside of the system.

An _Identifier_ (or _ID_ for short) is used to sign a _Message_ to show that it
comes from a specific _User_. An _ID_ might be a cryptographic _KeyPair_, a
_WebAuthn_ credential (for accessing a hardware authenticator), or even be
_Anonymous_ if a _User_ wants. A real world example might be a drivers license.

An _Address_ is the string representation of an _Identifier_. A real world
example might be a drivers license number.

## Usage

```js
import { ID } from "@liftedinit/many-js"

const anonymous = new ID() // Anonymous by default
const anonAddress = anonymous.toString() // "maa"

const keypair = ID.fromMnemonic("genuine leopard motion")
const keypairAddress = keypair.toString() // "mabc...789z" or similar

const webauthn = ID.createCredential() // Prompts browser
const webauthnAddress = webauthn.toString() // "mxyz...123a" or similar
```
