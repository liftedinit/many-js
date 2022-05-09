import { Network, NetworkModule } from "../network"

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

export function replacer(key: string, value: any) {
  if (value?.type === "Buffer") {
    return Buffer.from(value.data).toString("hex")
  } else if (value instanceof Map) {
    return Object.fromEntries(value.entries())
  } else if (typeof value === "bigint") {
    return parseInt(value.toString())
  } else if (key === "hash") {
    return Buffer.from(value).toString("hex")
  } else {
    return value
  }
}
