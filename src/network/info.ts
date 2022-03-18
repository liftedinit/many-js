import { Identity } from "../identity";
import { Message } from "../message";

interface Symbol {
  identity: string;
  name: string;
}

export interface LedgerInfo {
  symbols: Symbol[];
}

export class Info {
  static getLedgerInfo(message: Message): LedgerInfo {
    const result: LedgerInfo = { symbols: [] };
    if (message.content.has(4)) {
      const ledgerInfo = message.content.get(4);
      if (ledgerInfo.has(4)) {
        /**
         * todo: handle error - what does error look like?
         */
        const data = ledgerInfo.get(4);
        const entries = data.entries();
        for (const entry of entries) {
          const identity = new Identity(Buffer.from(entry[0].value)).toString();
          const name = entry[1];
          result.symbols.push({ identity, name });
        }
      }
      /**
       * todo: do we need to get timestamp or identity? maybe later?
       */
    }
    return result;
  }
}
