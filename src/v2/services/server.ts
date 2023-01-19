import { Anonymous, Identifier } from "../id"
import { Request, Response } from "../message"
import { CborMap } from "../message/encoding"

const INITIAL_SLEEP = 500
const sleep = async (t: number) => new Promise(r => setTimeout(r, t))

export abstract class Server {
  constructor(public url: string, public id: Identifier = new Anonymous()) {}

  async send(message: Request): Promise<Response> {
    const encoded = await message.toBuffer(this.id)
    console.log(encoded.toString("hex"))
    const cborData = await this.sendEncoded(encoded)
    // @TODO: Verify response
    return Response.fromBuffer(cborData)
  }

  async sendEncoded(encoded: Buffer) {
    const httpRes = await fetch(this.url, {
      method: "POST",
      headers: { "Content-Type": "application/cbor" },
      mode: "no-cors",
      body: encoded,
    })
    const arrayBuffer = await httpRes.arrayBuffer()
    return Buffer.from(arrayBuffer)
  }

  async call(method: string, data?: any, options = {}) {
    const from = this.id.toString()
    const req = Request.fromObject({ method, from, data, ...options })
    const res = await this.send(req)
    const result = res.result
    if (result.ok) {
      if (res.token) {
        return this.poll(res.token)
      }
      return result.value
    }
    throw result.error
  }

  async poll(token: Buffer, ms: number = INITIAL_SLEEP): Promise<any> {
    const poll = await this.call("async.status", new Map([[0, token]]))
    const { result } = poll.toObject()
    if (result.ok) {
      const [status, value] = (result.value as CborMap).values()
      switch (status) {
        case 0: // Unknown
          throw new Error(`Unknown request token: ${token.toString("hex")}`)
        case 1: // Queued
        case 2: // Processing
          await sleep(ms)
          return await this.poll(token, ms * 1.5)
        case 3: // Done
          return value
        case 4: // Expired
          throw new Error("Request token expired")
        default:
          throw new Error("Unknown request status")
      }
    }
    throw result.error
  }

  // For chaining, like server.as(id).call()
  as(id: Identifier): this {
    this.id = id
    return this
  }
}
