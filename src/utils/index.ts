import crypto from "crypto"
import { Message } from "../message"
import { ManyError, SerializedManyError } from "../message/error"
import { Network, NetworkModule } from "../network"

export * from "./transactions"

export function applyMixins<N extends Network, M extends NetworkModule[]>(
  network: N,
  modules: M,
): any {
  modules.forEach(module => {
    const namespace = module._namespace_
    // @ts-ignore
    network[namespace] = {}
    const props = Object.getOwnPropertyNames(module)
    props.forEach(prop => {
      const val = module[prop]
      if (typeof val === "function") {
        network[namespace][prop] = val.bind(network)
      } else {
        network[namespace][prop] = val
      }
    })
  })
}

export function throwOnErrorResponse(msg: Message) {
  const content = msg.getContent()?.get(4)
  if (
    content instanceof Map &&
    typeof content.get(0) === "number" &&
    Math.sign(content.get(0)) === -1
  ) {
    throw new ManyError(Object.fromEntries(content) as SerializedManyError)
  }
  return msg
}

export function makeRandomBytes(size = 32) {
  return crypto.randomBytes(size)
}
