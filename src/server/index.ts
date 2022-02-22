import { Identity } from "../identity";
import { KeyPair } from "../keys";
import { Cbor, Message, decode, encode } from "../message";

export class Server {
  url: string;
  keys: KeyPair | undefined;

  constructor(url: string, keys?: KeyPair) {
    this.url = url;
    this.keys = keys;
  }

  async send(message: Message) {
    const cbor = encode(message, this.keys);
    const reply = await this.sendEncoded(cbor);
    // @TODO: Verify response
    return decode(reply);
  }

  async sendEncoded(body: Cbor) {
    const response = await fetch(this.url, {
      method: "POST",
      headers: { "Content-Type": "application/cbor" },
      body,
    });
    const reply = await response.arrayBuffer();
    return Buffer.from(reply);
  }

  call(method: string, data?: any) {
    return this.send({ method, data });
  }

  // @TODO: Move these methods to modules/base, modules/ledger, etc.

  get base() {
    return {
      // 0 - Base
      endpoints: (prefix?: string) => this.call("endpoints", { prefix }),
      heartbeat: () => this.call("heartbeat"),
      status: () => this.call("status"),
    };
  }

  get blockchain() {
    return {
      // 1 - Blockchain
      info: () => this.call("blockchain.info"),
      block: () => {
        throw new Error("Not implemented");
      },
      transaction: () => {
        throw new Error("Not implemented");
      },
    };
  }

  get ledger() {
    return {
      // 2 - Ledger
      info: () => this.call("ledger.info"),
      balance: (symbols: string[]) =>
        this.call("ledger.balance", new Map([[1, symbols]])),
      mint: () => {
        throw new Error("Not implemented");
      },
      burn: () => {
        throw new Error("Not implemented");
      },
      send: (to: Identity, amount: bigint, symbol: string) =>
        this.call(
          "account.send",
          new Map<number, any>([
            [1, to.toString()],
            [2, amount],
            [3, symbol],
          ])
        ),

      // 4 - Ledger Transactions
      transactions: () => {
        throw new Error("not implemented");
      },
      list: () => {
        throw new Error("not implemented");
      },
    };
  }

  get kvstore() {
    return {
      // 3 - KVStore
      info: () => {
        throw new Error("Not implemented");
      },
      get: () => {
        throw new Error("Not implemented");
      },
      put: () => {
        throw new Error("Not implemented");
      },
      delete: () => {
        throw new Error("Not implemented");
      },
    };
  }
}
