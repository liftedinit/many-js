# Users, Identifiers (IDs), and Addresses

A _User_ is an entity that interacts with the Many protocol by sending requests
and receiving responses. This entity might be a real person or a process running
inside or outside of the system. As it represents an external entity, a _User_
does not have a corresponding model within the codebase (i.e. there's no "User"
class).

An _Identifier_ (or _ID_ for short) is used to sign a _Message_ to show that it
comes from a specific _User_. An _ID_ might be a cryptographic _KeyPair_, a
_WebAuthn_ credential (for accessing a hardware authenticator), or even be
_Anonymous_ if a _User_ wants. A real world example might be a drivers license.

An _Address_ is the string representation of an _Identifier_. A real world
example might be a drivers license number.

## Usage

```js
import { Anonymous, KeyPair, WebAuthn } from "@liftedinit/many-js"

const anonymous = new Anonymous()
const anonAddress = anonymous.toString() // "maa"

const keypair = KeyPair.fromMnemonic("genuine leopard motion")
const keypairAddress = keypair.toString() // "mabc...789z" or similar

const webauthn = await WebAuthn.create() // Prompts browser
const webauthnAddress = webauthn.toString() // "mxyz...123a" or similar
```
