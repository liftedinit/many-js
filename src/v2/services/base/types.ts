export interface BaseEndpoints {
  endpoints: string[]
}

export interface BaseStatus {
  protocolVersion: number
  serverName: string
  publicKey: unknown
  address: string
  attributes: string[]
  serverVersion: string
  timeDeltaInSecs: number
}
