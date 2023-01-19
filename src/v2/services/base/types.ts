export interface Endpoints {
  endpoints: string[]
}

export interface Status {
  protocolVersion: number
  serverName: string
  publicKey: unknown
  address: string
  attributes: string[]
  serverVersion: string
  timeDeltaInSecs: number
}
