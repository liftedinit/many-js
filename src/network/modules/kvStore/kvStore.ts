import { Message } from "../../../message"
import { tag } from "../../../message/cbor"
import { makeRandomBytes } from "../../../utils"
import {
  KVStoreDisableParam,
  KVStoreGetParam,
  KVStoreInfo,
  KVStoreList,
  KVStoreModule,
  KVStorePutParam,
  KVStoreQuery,
  KVStoreTransferParam,
  KVStoreValue,
} from "./types"

export const KvStore: KVStoreModule = {
  _namespace_: "kvStore",
  async info(): Promise<KVStoreInfo> {
    const res = await this.call("kvstore.info")
    return getKVStoreInfo(res)
  },

  async list(): Promise<KVStoreList> {
    const res = await this.call("kvstore.list", {})
    return getKVStoreList(res)
  },

  async get(param: KVStoreGetParam): Promise<KVStoreValue> {
    const data = makeKVStoreGet(param)
    const res = await this.call("kvstore.get", data)
    return getKVStoreValue(res, param.key)
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
    return getKVStoreQuery(res, param.key)
  },

  async disable(
    param: KVStoreDisableParam,
    { nonce } = { nonce: makeRandomBytes(16) },
  ) {
    const data = makeKVStoreDisable(param)
    await this.call("kvstore.disable", data, { nonce })
  },

  async transfer(
    param: KVStoreTransferParam,
    { nonce } = { nonce: makeRandomBytes(16) },
  ) {
    const data = makeKVStoreTransfer(param)
    await this.call("kvstore.transfer", data, { nonce })
  },
}

// Make maps from objects

function makeKVStoreGet(param: KVStoreGetParam): Map<number, any> {
  const data = new Map()
  data.set(0, Buffer.from(param.key))
  return data
}

function makeKVStorePut(param: KVStorePutParam): Map<number, any> {
  const data = new Map()
  data.set(0, Buffer.from(param.key))
  data.set(1, Buffer.from(param.value))
  param.owner && data.set(2, tag(10000, param.owner))
  return data
}

function makeKVStoreDisable(param: KVStoreDisableParam): Map<number, any> {
  const data = new Map()
  data.set(0, Buffer.from(param.key))
  param.owner && data.set(1, tag(10000, param.owner))
  return data
}

function makeKVStoreTransfer(param: KVStoreTransferParam): Map<number, any> {
  const data = new Map()
  data.set(0, Buffer.from(param.key))
  data.set(2, tag(10000, param.newOwner))
  param.owner && data.set(1, tag(10000, param.owner))
  return data
}

// Get objects from maps

function getKVStoreInfo(message: Message): KVStoreInfo {
  const data = message.getPayload()
  const result: KVStoreInfo = {
    hash: Buffer.from(data.get(0)).toString("hex"),
  }
  return result
}

function getKVStoreList(message: Message): KVStoreList {
  const data = message.getPayload()
  const result: KVStoreList = {
    keys: (data.get(0) as Buffer[]).map(bytes => bytes.toString()),
  }
  return result
}

function getKVStoreValue(message: Message, key: string): KVStoreValue {
  const data = message.getPayload()
  // Many can sometimes return an empty object instead of a map
  const value = data instanceof Map ? data.get(0) : undefined
  const result: KVStoreValue = { key, value }
  return result
}

function getKVStoreQuery(message: Message, key: string): KVStoreQuery {
  const data = message.getPayload()
  const result: KVStoreQuery = {
    key,
    owner: data.get(0),
    enabled: data.get(1),
  }
  return result
}
