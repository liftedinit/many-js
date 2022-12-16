import { Message } from "../../../message"
import { makeRandomBytes } from "../../../utils"
import {
  KVStoreDisableParam,
  KVStoreGetParam,
  KVStoreInfo,
  KVStoreModule,
  KVStorePutParam,
  KVStoreQuery,
  KVStoreValue,
} from "./types"

export const KvStore: KVStoreModule = {
  _namespace_: "kvStore",
  async info(): Promise<KVStoreInfo> {
    const res = await this.call("kvstore.info")
    return getKVStoreInfo(res)
  },

  async get(param: KVStoreGetParam): Promise<KVStoreValue> {
    const data = makeKVStoreGet(param)
    const res = await this.call("kvstore.get", data)
    return getKVStoreValue(res)
  },

  async put(
    param: KVStorePutParam,
    { nonce } = { nonce: makeRandomBytes(16) },
  ) {
    const data = makeKVStorePut(param)
    await this.call("kvstore.put", data, { nonce })
  },

  async query(param: KVStoreGetParam): Promise<KVStoreQuery> {
    const data = makeKVStoreGet(param)
    const res = await this.call("kvstore.query", data)
    return getKVStoreQuery(res)
  },

  async disable(
    param: KVStoreDisableParam,
    { nonce } = { nonce: makeRandomBytes(16) },
  ) {
    const data = makeKVStoreDisable(param)
    await this.call("kvstore.disable", data, { nonce })
  },
}

// Make maps from objects

function makeKVStoreGet(param: KVStoreGetParam): Map<number, any> {
  const data = new Map()
  data.set(0, param.key)
  return data
}

function makeKVStorePut(param: KVStorePutParam): Map<number, any> {
  const data = new Map()
  data.set(0, param.key)
  data.set(1, param.value)
  param.owner && data.set(2, param.owner)
  return data
}

function makeKVStoreDisable(param: KVStoreDisableParam): Map<number, any> {
  const data = new Map()
  data.set(0, param.key)
  param.owner && data.set(1, param.owner)
  return data
}

// Get objects from maps

function getKVStoreInfo(message: Message): KVStoreInfo {
  const data = message.getPayload()
  const result: KVStoreInfo = {
    hash: Buffer.from(data.get(0)).toString(),
  }
  return result
}

function getKVStoreValue(message: Message): KVStoreValue {
  const data = message.getPayload()
  const result: KVStoreValue = {
    value: data.get(0),
  }
  return result
}

function getKVStoreQuery(message: Message): KVStoreQuery {
  const data = message.getPayload()
  const result: KVStoreQuery = {
    owner: data.get(0),
    enabled: data.get(1),
  }
  return result
}
