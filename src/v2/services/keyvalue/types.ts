export interface KeyValueDisableArgs {
  key: string
  owner?: string
}

export interface KeyValueGet {
  value?: string
}

export interface KeyValueGetArgs {
  key: string
}

export interface KeyValueInfo {
  hash: string
}

export interface KeyValuePutArgs {
  key: string
  value: any
  owner?: string
}

export interface KeyValueQuery {
  owner: string
  enabled: boolean
}

export interface KeyValueQueryArgs {
  key: string
}
