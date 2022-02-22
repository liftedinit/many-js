# Many Library

This library can be used by JavaScript applications to connect to servers that support the Many Protocol.

## Usage

Generating key pairs.

```ts
keys.fromSeedWords(string); // => KeyPair
keys.fromPem(string); // => KeyPair
```

Managing identities.

```ts
identity = new Identity.fromPublicKey(key); // => Identity
identity = new Identity.fromString(string); // => Identity
anonymous = new Identity(); // => Anonymous Identity

identity.toString(keys); // => "ow7aekyjtsx2hmeadrua5cpitgy7pykjkok3gyth3ggsio4zwa"
identity.toHex(keys); // => "01e736fc9624ff8ca7956189b6c1b66f55f533ed362ca48c884cd20065";
```

Encoding and decoding messages.

```ts
msg = { to, from, method, data, timestamp, version };

message = new Message(msg); // => Anonymous CBOR Buffer
message = new Message(msg, keys); // => Signed CBOR Buffer

message.decode(); // => Object
```

Sending and receiving messages from a server.

```ts
server = new Server(url, keys);

server.sendEncoded(cbor); // => Encoded Response
server.send(msg); // => Decoded Response

server.base.endpoints(); // => Decoded and Parsed Response
server.ledger.info(); // => Decoded and Parsed Response
```
