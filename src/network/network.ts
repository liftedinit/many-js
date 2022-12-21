import { Identity } from "../identity"
import { Message } from "../message/message"
import { CborData } from "../message/encoding"
import { applyMixins } from "../utils"
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
    const cbor = await req.toBuffer(this.identity)
    const reply = await this.sendEncoded(cbor)
    // @TODO: Verify response
    const res = await Async.handleAsyncToken.call(
      this,
      Message.fromBuffer(reply),
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

  async call(method: string, data?: any, opts = {}) {
    const req = Message.fromObject({
      method,
      from: this.identity ? await this.identity.getAddress() : undefined,
      data,
      ...opts,
    })
    return await this.send(req)
  }
}
