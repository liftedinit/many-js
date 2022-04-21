import { Address } from "../identity"
import { KeyPair } from "../keys"
import { Message } from "../message"
import { CborData } from "../message/cbor"
import { applyMixins } from "../utils"
import { NetworkModule } from "./modules"

export class Network {
  [k: string]: any
  url: string
  keys: KeyPair | undefined

  constructor(url: string, keys?: KeyPair) {
    this.url = url
    this.keys = keys
  }

  apply(modules: NetworkModule[]) {
    applyMixins(this, modules)
  }

  async send(req: Message) {
    const cbor = req.toCborData(this.keys)
    const reply = await this.sendEncoded(cbor)
    // @TODO: Verify response
    const res = Message.fromCborData(reply)
    return res
  }

  async sendEncoded(body: CborData) {
    const res = await fetch(this.url, {
      method: "POST",
      headers: { "Content-Type": "application/cbor" },
      body,
    })
    const reply = await res.arrayBuffer()
    return Buffer.from(reply)
  }

  call(method: string, data?: any) {
    const req = Message.fromObject({
      method,
      from: this.keys?.publicKey
        ? Address.fromPublicKey(this.keys.publicKey)
        : undefined,
      data,
    })
    return this.send(req)
  }

  // @TODO: Move these methods to modules/base, modules/ledger, etc.

  get base() {
    return {
      // 0 - Base
      endpoints: (prefix?: string) => this.call("endpoints", { prefix }),
      heartbeat: () => this.call("heartbeat"),
      status: () => this.call("status"),
    }
  }
}
