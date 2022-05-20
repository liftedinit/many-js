import cbor from "cbor"
import { AnonymousIdentity } from "../../../identity"
import { Message } from "../../../message"
import { Network } from "../../network"
import type { NetworkModule } from "../types"

interface Async extends NetworkModule {
  handleAsyncToken: (message: Message, n?: Network) => Promise<unknown>
}

export const Async: Async = {
  _namespace_: "async",

  async handleAsyncToken(message: Message, n?: Network) {
    const asyncToken = getAsyncToken(message)
    if (asyncToken) {
      return await fetchAsyncStatus(
        n ?? new Network(this.url, new AnonymousIdentity()),
        asyncToken,
      )
    }
    return message
  },
}

function getAsyncToken(message: Message) {
  let token = undefined
  if (message.content.has(8)) {
    const responseAttrs = message.content.get(8)
    if (Array.isArray(responseAttrs)) {
      let attr = responseAttrs.find(attr => {
        if (Array.isArray(attr) && attr[0] === 1) {
          return attr
        }
      })
      token = attr?.[1]
    }
  }
  return token
}

async function fetchAsyncStatus(
  n: Network,
  asyncToken: ArrayBuffer,
): Promise<Message> {
  const res = (await n.call(
    "async.status",
    new Map([[0, asyncToken]]),
  )) as Message

  if (res.content && res.content instanceof Map && res.content.has(4)) {
    const content = res.content.get(4)
    const decoded = cbor.decode(content)
    if (decoded.has(0)) {
      const asyncResult = decoded.get(0)
      if (asyncResult === 3 && decoded.has(1)) {
        const msg = cbor.decode(decoded.get(1)).value
        return new Message(msg)
      } else {
        await new Promise(r => setTimeout(r, 250))
        return await fetchAsyncStatus(n, asyncToken)
      }
    }
  }
  return res
}
