import { KeyPair } from "../keys"
import { Message } from "../message"
import { CborData } from "../message/cbor"
import { applyMixins } from "../utils"

export class Network {
  url: string
  keys: KeyPair | undefined

  constructor(url: string, keys?: KeyPair) {
    this.url = url
    this.keys = keys
  }

  apply(modules: unknown[]) {
    applyMixins.call(this, modules)
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
    const req = Message.fromObject({ method, data })
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
