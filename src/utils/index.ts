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
