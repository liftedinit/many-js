export const Blockchain = {
  _namespace_: "blockchain",
  async info(): Promise<unknown> {
    // @ts-ignore
    return await this.call("blockchain.info")
  },

  async block(): Promise<unknown> {
    // @ts-ignore
    return this.call("blockchain.block", {})
  },

  async transaction(): Promise<unknown> {
    // @ts-ignore
    return await this.call("blockchain.transaction", new Map([[1, symbols]]))
  },
}
