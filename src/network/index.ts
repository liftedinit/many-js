import { Identity } from "../identity";
import { KeyPair } from "../keys";
import { Message } from "../message";
import { CborData } from "../message/cbor";
import { Info } from "./info";

export class Network {
  url: string;
  keys: KeyPair | undefined;

  constructor(url: string, keys?: KeyPair) {
    this.url = url;
    this.keys = keys;
  }

  async send(req: Message) {
    const cbor = req.toCborData();
    const reply = await this.sendEncoded(cbor);
    // @TODO: Verify response
    const res = Message.fromCborData(reply);
    return res;
  }

  async sendEncoded(body: CborData) {
    const res = await fetch(this.url, {
      method: "POST",
      headers: { "Content-Type": "application/cbor" },
      body,
    });
    const reply = await res.arrayBuffer();
    return Buffer.from(reply);
  }

  call(method: string, data?: any) {
    const req = Message.fromObject({ method, data });
    return this.send(req);
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
      info: async () => {
        const message = await this.call("ledger.info");
        return Info.getLedgerInfo(message);
      },
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
