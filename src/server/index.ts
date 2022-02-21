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
  connect() {
    return {
      // 0 - Base
      endpoints: (prefix?: string) => this.call("endpoints", { prefix }),
      heartbeat: () => this.call("heartbeat"),
      status: () => this.call("status"),

      // 1 - Blockchain
      blockchainInfo: () => this.call("blockchain.info"),
      blockchainBlock: () => {
        throw new Error("Not implemented");
      },
      blockchainTransaction: () => {
        throw new Error("Not implemented");
      },

      // 2 - Ledger
      ledgerInfo: () => this.call("ledger.info"),
      ledgerBalance: (symbols: string[]) =>
        this.call("ledger.balance", new Map([[1, symbols]])),
      ledgerMint: () => {
        throw new Error("Not implemented");
      },
      ledgerBurn: () => {
        throw new Error("Not implemented");
      },
      ledgerSend: (to: Identity, amount: bigint, symbol: string) =>
        this.call(
          "account.send",
          new Map<number, any>([
            [1, to.toString()],
            [2, amount],
            [3, symbol],
          ])
        ),

      // 3 - KVStore
      kvInfo: () => {
        throw new Error("Not implemented");
      },
      kvGet: () => {
        throw new Error("Not implemented");
      },
      kvPut: () => {
        throw new Error("Not implemented");
      },
      kvDelete: () => {
        throw new Error("Not implemented");
      },

      // 4 - Ledger Transactions
      ledgerTransactions: () => {
        throw new Error("Not implemented");
      },
      ledgerList: () => {
        throw new Error("Not implemented");
      },
    };
  }
}
