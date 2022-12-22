import { Identity } from "../identity"
import { Request, Response } from "../message"

export abstract class Server {
  constructor(public url: string, public id?: Identity | undefined) {}

  async send(message: Request): Promise<Response> {
    const encoded = await message.toBuffer(this.id)
    const cborData = await this.sendEncoded(encoded)
    // @TODO: Verify response
    // @TODO: Handle pending "async" request
    return Response.fromBuffer(cborData) as Response
  }

  async sendEncoded(encoded: Buffer) {
    const httpRes = await fetch(this.url, {
      method: "POST",
      headers: { "Content-Type": "application/cbor" },
      body: encoded,
    })
    const arrayBuffer = await httpRes.arrayBuffer()
    return Buffer.from(arrayBuffer)
  }

  async call(method: string, data?: any, options = {}) {
    const from = this.id ? this.id.getAddress() : undefined
    const manyReq = Request.fromObject({ method, from, data, ...options })
    const manyRes = await this.send(manyReq)
    // @TODO: Handle errors
    return manyRes.getPayload()
  }
}
