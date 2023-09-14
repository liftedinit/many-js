import { Identity } from "../identity"
import { Message } from "../message"
import { CborData } from "../message/cbor"
import { applyMixins } from "../utils"
import { NetworkModule } from "./modules"
import { Async } from "./modules/async"

interface Options {
  DEBUG?: boolean
}

export class Network {
  [k: string]: any
  url: string
  identity: Identity | undefined
  options: Options

  constructor(url: string, identity?: Identity, options?: Options) {
    this.url = url
    this.identity = identity
    this.options = options ?? { DEBUG: false }
  }

  apply(modules: NetworkModule[]) {
    applyMixins(this, modules)
  }

  async send(req: Message) {
    const cbor = await req.toCborData(this.identity)

    if (this.options.DEBUG) {
      console.log(cbor.toString("hex"))
    }
    const reply = await this.sendEncoded(cbor)
    if (this.options.DEBUG) {
      console.log(reply.toString("hex"))
    }
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
