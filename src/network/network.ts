import { Identity } from "../identity"
import { CborData } from "../message/encoding"
import { applyMixins } from "../utils"
import { NetworkModule } from "./modules"
import { Async } from "./modules/async"
import { Request, Response } from "../message"

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

  async send(req: Request): Promise<Response> {
    const cbor = await req.toBuffer(this.identity)
    const reply = await this.sendEncoded(cbor)
    const res = await Async.handleAsyncToken.call(
      this,
      Response.fromBuffer(reply) as Response,
    )
    return res as Response
  }

  async sendEncoded(body: CborData): Promise<Buffer> {
    const res = await fetch(this.url, {
      method: "POST",
      headers: { "Content-Type": "application/cbor" },
      body,
    })
    const reply = await res.arrayBuffer()
    return Buffer.from(reply)
  }

  async call(method: string, data?: any, opts = {}): Promise<Response> {
    const req = Request.fromObject({
      method,
      from: this.identity ? this.identity.getAddress() : undefined,
      data,
      ...opts,
    })
    return await this.send(req)
  }
}
