import { Identity } from "../identity"
import { Message } from "../message"
import { CborData } from "../message/cbor"

export abstract class Server {
  constructor(public url: string, public id?: Identity | undefined) {}

  async send(message: Message) {
    const encoded = await message.toCborData(this.id)
    const cborData = await this.sendEncoded(encoded)
    // @TODO: Verify response
    // @TODO: Handle pending "async" request
    return Message.fromCborData(cborData)
  }

  async sendEncoded(encoded: CborData) {
    const httpRes = await fetch(this.url, {
      method: "POST",
      headers: { "Content-Type": "application/cbor" },
      body: encoded,
    })
    const arrayBuffer = await httpRes.arrayBuffer()
    return Buffer.from(arrayBuffer)
  }

  async call(method: string, data?: any, options = {}) {
    // @TODO: Make synchronous
    const from = this.id ? await this.id.getAddress() : undefined
    const manyReq = Message.fromObject({ method, from, data, ...options })
    const manyRes = await this.send(manyReq)
    // @TODO: Handle errors
    return manyRes.getPayload()
  }
}
