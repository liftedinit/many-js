# OMNI Library

This folder represents code that should be extracted and published as a separate package.

## Usage

Managing identities.

```ts
omni.identity.fromSeedWords(string); // => KeyPair
omni.identity.fromPem(string); // => KeyPair
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
omni.server.sendEncoded(url, cbor); // => { height: 0, symbols: ["FBT"], hash: Buffer }
omni.server.send(url, msg); // => { height: 0, ...etc }
omni.server.send(url, msg, keys); // => { height: 0, ...etc }
```
