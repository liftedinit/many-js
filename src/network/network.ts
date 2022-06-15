import { Identity } from "../identity"
import { Message } from "../message"
import { CborData } from "../message/cbor"
import { applyMixins, throwOnErrorResponse } from "../utils"
import { NetworkModule } from "./modules"
import { Async } from "./modules/async"

export class Network {
  [k: string]: any
  url: string
  identity: Identity | undefined

  constructor(url: string, identity?: Identity) {
    this.url = url
    this.identity = identity
  }

  apply(modules: NetworkModule[]) {
    applyMixins(this, modules)
  }

  async send(req: Message) {
    const cbor = await req.toCborData(this.identity)
    const reply = await this.sendEncoded(cbor)
    // @TODO: Verify response
    const res = await Async.handleAsyncToken.call(
      this,
      Message.fromCborData(reply),
    )
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

  async call(method: string, data?: any) {
    const req = Message.fromObject({
      method,
      from: this.identity ? await this.identity.getAddress() : undefined,
      data,
    })
    return await this.send(req)
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
