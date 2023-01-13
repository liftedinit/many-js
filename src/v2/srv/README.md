# Servers and Services

A _Server_ is an entity that supports the Many protocol. The entity may be a
single machine or a group of machines operating together. Every Server responds
to the base methods of `endpoints`, `heartbeat`, and `status`.

A _Service_ is a specialized entity that extends a Server by responding to
specialized methods (like `ledger.info` in the case of a Ledger service).

## Usage

An application can import a service directly and immediately start calling its
methods.

```js
import { KeyValue } from "@liftedinit/many-js"

const kv = new KeyValue(url)
await kv.put("name", "Joe")

const value = await kv.get("name") // => Joe
```
