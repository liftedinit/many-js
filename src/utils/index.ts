import * as nodeCrypto from "crypto"
import { Message } from "../message"
import { ManyError, SerializedManyError } from "../message/error"
import {
  Bound,
  BoundType,
  Network,
  NetworkModule,
  Range,
  RangeBounds,
} from "../network"
import { RangeType } from "../network/modules/events/events"

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
  if (typeof globalThis.crypto === "undefined") {
    return nodeCrypto.randomBytes(size)
  }
  return crypto.getRandomValues(new Uint8Array(size))
}

export function setRangeBound<T>({
  rangeMap,
  rangeType,
  boundType,
  value,
}: {
  rangeMap: Range<T>
  rangeType: RangeType
  boundType: BoundType
  value: unknown
}) {
  const rangeVal = rangeType === RangeType.lower ? 0 : 1
  const boundVal = (
    boundType !== BoundType.unbounded
      ? [boundType === BoundType.inclusive ? 0 : 1, value]
      : []
  ) as Bound<T>
  rangeMap.set(rangeVal, boundVal)
}

export function makeRange<T>(range: RangeBounds<T>) {
  const rangeMap = new Map()
  if (range && range.length) {
    const [lower, upper] = range
    if (lower) {
      setRangeBound<Uint8Array>({
        rangeMap,
        rangeType: RangeType.lower,
        ...lower,
      })
    }
    if (upper) {
      setRangeBound<Uint8Array>({
        rangeMap,
        rangeType: RangeType.upper,
        ...upper,
      })
    }
  }
  return rangeMap
}

export function arrayBufferToHex(b: ArrayBuffer) {
  return Buffer.from(b).toString("hex")
}
