import cbor from "cbor";
import { Identity } from "../../../identity";
import { Message } from "../../../message";

export interface LedgerInfo {
  symbols: Map<ReturnType<Identity["toString"]>, string>;
}

export class Ledger {
  async fetchLedgerInfo(): Promise<LedgerInfo> {
    debugger;
    // @ts-ignore
    const message = await this.call("ledger.info");
    return getLedgerInfo(message);
  }

  async balance(symbols: string[]) {
    // @ts-ignore
    return await this.call("ledger.balance", new Map([[1, symbols]]));
  }

  mint() {
    throw new Error("Not implemented");
  }

  burn() {
    throw new Error("Not implemented");
  }

  async ledgerSend(to: Identity, amount: bigint, symbol: string) {
    // @ts-ignore
    return await this.call(
      "account.send",
      new Map<number, any>([
        [1, to.toString()],
        [2, amount],
        [3, symbol],
      ])
    );
  }

  // 4 - Ledger Transactions
  transactions() {
    throw new Error("not implemented");
  }

  list() {
    throw new Error("not implemented");
  }
}

export function getLedgerInfo(message: Message): LedgerInfo {
  const result: LedgerInfo = { symbols: new Map() };
  if (message.content.has(4)) {
    const decodedContent = cbor.decodeFirstSync(message.content.get(4));
    if (decodedContent.has(4)) {
      const symbols = decodedContent.get(4);

      for (const symbol of symbols) {
        const identity = new Identity(Buffer.from(symbol[0].value)).toString();
        const symbolName = symbol[1];
        result.symbols.set(identity, symbolName);
      }
    }
    /**
     * todo: do we need to get timestamp or identity? maybe later?
     */
  }
  return result;
}
