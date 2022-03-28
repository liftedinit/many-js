export const KvStore = {
  name: "kvStore",
  async info(): Promise<unknown> {
    // @ts-ignore
    return await this.call("kvstore.info")
  },

  async get(symbols: string[]) {
    // @ts-ignore
    throw new Error("Not implemented")
  },

  async put() {
    throw new Error("Not implemented")
  },

  async delete() {
    throw new Error("Not implemented")
  },
}
