import cbor from "cbor"
import { Message } from "../../../message"
import { NetworkModule, NetworkAttributes } from "../types"

export interface Base extends NetworkModule {
  endpoints: () => Promise<NetworkEndpointsResponse>
  heartbeat: () => Promise<unknown>
  status: () => Promise<NetworkStatusResponse>
}

export type NetworkStatusInfo = {
  protocolVersion: number
  serverName: string
  publicKey: unknown
  address: string
  attributes: NetworkAttributes[]
  serverVersion: string
  timeDeltaInSecs: number
  [k: string]: unknown
}

export type NetworkStatusResponse = {
  status: NetworkStatusInfo | undefined
}

export type NetworkEndpointsResponse = {
  endpoints: string[]
}

export const Base: Base = {
  _namespace_: "base",

  async endpoints() {
    const msg = await this.call("endpoints")
    return await getEndpoints(msg)
  },

  async heartbeat() {
    const res = await this.call("heartbeat")
    return res.getPayload()
  },

  async status() {
    const msg = await this.call("status")
    return await getNetworkStatus(msg)
  },
}

async function getNetworkStatus(msg: Message): Promise<NetworkStatusResponse> {
  const result: NetworkStatusResponse = {
    status: undefined,
  }
  const content = msg.getPayload()
  if (content instanceof Map) {
    const publicKey = content.has(2) ? cbor.decode(content.get(2)) : null
    result.status = {
      protocolVersion: content.get(0),
      serverName: content.get(1),
      publicKey,
      address: content.get(3)?.toString(),
      attributes: content.get(4),
      serverVersion: content.get(5),
      timeDeltaInSecs: content.get(7),
    }
  }
  return result
}

async function getEndpoints(msg: Message): Promise<NetworkEndpointsResponse> {
  const result: NetworkEndpointsResponse = {
    endpoints: [],
  }
  const content = msg.getPayload()
  if (Array.isArray(content)) {
    result.endpoints = content
  }
  return result
}
