# Messages, Requests, and Responses

A _Message_ is a carrier for content into or out of the Many protocol. In most
cases a more specific _Request_ or _Response_ should be used.

A _Request_ represents a _Message_ being sent to a server. The _Request_ is
anonymous by default but may be signed by using a _KeyPair_ or _WebAuthn_
identifier. It can be created from a JavaScript object containing the correct
fields.

A _Response_ represents a _Message_ being returned by the server. The content
might be data relating to the corresponding _Request_ or might be an _Error_.
Additionally, the _Response_ may indicate the the _Request_ is being processed
asynchronously and will require polling to retrive the requested data.

## Usage

```js
import { Request, Response } from "@liftedinit/many-js"

const req = Request.fromObject({ method: "status" })
const buffer = req.toBuffer() // Anonymous CBOR buffer, ready to send

const res = Response.fromBuffer(someBytes)
const { result } = res.toObject()

if (result.ok) {
  doSomethingWith(result.value) // Response data is present
} else {
  throw result.err // An error was returned
}
```
