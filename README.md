# Many Library

This library can be used by JavaScript applications to connect to networks that
support the Many Protocol.

## Usage

Instantiate Network and apply modules.

```ts
import {
  Account,
  Base,
  Events,
  IdStore,
  Ledger,
  Network,
} from "@liftedinit/many-js"

const network = new Network("/api", identity)
network.apply([Account, Base, Events, IdStore, Ledger])
```

Generating key pairs.

```ts
KeyPair.fromSeedWords(string) // => KeyPair
KeyPair.fromPem(string) // => KeyPair
```

Managing identities.

```ts
identity = Address.fromPublicKey(key) // => Address
identity = Address.fromString(string) // => Address
anonymous = new Address() // => Anonymous Address

identity.toString(keys) // => "mw7aekyjtsx2hmeadrua5cpitgy7pykjkok3gyth3ggsio4zwa"
identity.toHex(keys) // => "01e736fc9624ff8ca7956189b6c1b66f55f533ed362ca48c884cd20065";
```

Encoding and decoding messages.

```ts
msg = { to, from, method, data, timestamp, version }

message = Message.fromObject(msg) // Message
message.toCborData() // => Anonymous CBOR Buffer
message.toCborData(keys) // => Signed CBOR Buffer

message.content // => Object
```

Sending and receiving messages from a network.

```ts
network = new Network(url, keys)

network.sendEncoded(cbor) // => Encoded Response
network.send(msg) // => Decoded Response

network.base.endpoints() // => Decoded and Parsed Response
network.ledger.info() // => Decoded and Parsed Response
```

### Account

```ts
// add the Account module
import { Account } from "@liftedinit/many-js"
network.apply([Account])
```

#### create

- create an account with roles and features

```ts
const roles = new Map().set("ma123....", [
  AccountRole[AccountRole.canMultisigApprove],
  AccountRole[AccountRole.canMultisigSubmit],
])

const features = [
  AccountFeatureTypes.accountLedger,
  [
    AccountFeatureTypes.accountMultisig,
    new Map()
      .set(AccountMultisigArgument.threshold, 2)
      .set(AccountMultisigArgument.expireInSecs, 3600)
      .set(AccountMultisigArgument.executeAutomatically, false),
  ],
]
await network.account.create("account name", roles, features)
```

#### addFeatures

- add roles and features to an existing account

```ts
const roles = new Map().set("ma321.....", [
  AccountRole[AccountRole.canLedgerTransact],
])

const features = [
  [
    AccountFeatureTypes.accountLedger,
    AccountFeatureTypes.accountMultisig,
    new Map()
      .set(AccountMultisigArgument.threshold, 2)
      .set(AccountMultisigArgument.expireInSecs, 3600)
      .set(AccountMultisigArgument.executeAutomatically, false),
  ],
]

await network.account.addFeatures({ account: "ma12345.....", roles, features })
```

#### setDescription

- modify the description of an existing account

```ts
const accountAddress = "ma987....."

await network.account.setDescription(
  accountAddress,
  "new account name-description",
)
```

#### addRoles

- add roles to an existing account

```ts
const accountAddress = "ma987....."
const roles = new Map()
  .set("ma321.....", [AccountRole[AccountRole.canLedgerTransact]])
  .set("ma123.....", [
    AccountRole[AccountRole.canLedgerTransact],
    AccountRole[AccountRole.canLedgerSubmit],
  ])
await network.account.addRoles(accountAddress, roles)
```

#### removeRoles

- remove roles to an existing account

```ts
const accountAddress = "ma987....."
const roles = new Map().set("ma321.....", [
  AccountRole[AccountRole.canLedgerTransact],
])

await network.account.removeRoles(accountAddress, roles)
```

#### multisigInfo

- get multisig transaction info given a token

```ts
await network.account.multisigInfo(token)
```

### Blockchain

```ts
// first apply the blockchain module
import { Blockchain } from "@liftedinit/many-js"
network.apply([Blockchain])
```

#### info

- get info about blockchain

```ts
const res = await network.blockchain.info()
```

#### block

- get info about a single block by block hash or height

```ts
const res = await network.blockchain.block(SingleBlockQueryType.height, 12345)
```

#### list

- get a list of blocks by height or time

```ts
const res = await network.blockchain.list({
  queryType: RangeBlockQueryType.height,
  count: 10,
  order: ListOrderType.ascending,
  range: [
    { boundType: BoundType.inclusive, value: 95 },
    { boundType: BoundType.inclusive, value: 100 },
  ],
})
```

#### transaction

- get transaction by transaction hash

```ts
const res = await network.blockchain.transaction(txnHash)
```

#### request

- get request data of a transaction via transaction hash

```ts
const res = await network.blockchain.request(txnHash)
```

#### response

- get response data of a transaction via transaction hash

```ts
const res = await network.blockchain.response(txnHash)
```
