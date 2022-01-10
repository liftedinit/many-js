# OMNI Library

This library can be used by JavaScript applications to connect to servers that support the
Omni Protocol.

## Usage

Generating key pairs;

```ts
omni.keys.fromSeedWords(string); // => KeyPair
omni.keys.fromPem(string); // => KeyPair
```

Managing identities.

```ts
omni.identity.fromPublicKey(key); // => COSE Key
omni.identity.toString(keys); // => "ow7aekyjtsx2hmeadrua5cpitgy7pykjkok3gyth3ggsio4zwa"
omni.identity.toHex(keys); // => "01e736fc9624ff8ca7956189b6c1b66f55f533ed362ca48c884cd20065";
```

Encoding and decoding messages.

```ts
const msg = { to, from, method, data, timestamp, version };
omni.message.encode(msg); // => Anonymous CBOR Buffer
omni.message.encode(msg, keys); // => Signed CBOR Buffer
omni.message.decode(cbor); // => Object
```

Sending and receiving messages.

```ts
omni.server.sendEncoded(url, cbor); // => Encoded Response
omni.server.send(url, msg); // => Decoded Response
omni.server.send(url, msg, keys); // => Decoded Response
```

Alternative syntax for sending and receiving messages.

```ts
const server = omni.server.connect(url);
server.endpoints(); // => Decoded and Parsed Response
server.ledgerInfo(); // => Decoded and Parsed Response
```
