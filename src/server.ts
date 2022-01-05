import { Identity as ID } from "./identity";
import { Cbor, Message, decode, encode } from "./message";

export async function sendEncoded(url: string, cbor: Cbor): Promise<Cbor> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/cbor" },
    body: cbor,
  });
  const buffer = await response.arrayBuffer();
  return Buffer.from(buffer);
}

export async function send(
  url: string,
  message: Message,
  keys: ID = null
): Promise<any> {
  const cbor = encode(message, keys);
  const reply = await sendEncoded(url, cbor);
  // @TODO: Verify response
  return decode(reply);
}

export function connect(url: string) {
  return {
    call: (method: string, args?: any, keys?: ID) =>
      call(url, method, args, keys),

    // Legacy - REMOVE when Albert is using new methods below
    ledger_info: () => call(url, "ledger.info"),
    ledger_balance: (symbols: string[], keys: ID) =>
      call(url, "ledger.balance", new Map([[1, symbols]]), keys),

    // Base
    endpoints: (prefix?: string) => call(url, "endpoints", { prefix }),
    heartbeat: () => call(url, "heartbeat"),
    status: () => call(url, "status"),
    echo: (message: any) => call(url, "echo", message),

    // Blockchain
    blockchainInfo: () => call(url, "blockchain.info"),
    blockchainBlockAt: (height: number) =>
      call(url, "blockchain.blockAt", height),

    // Ledger
    ledgerBalance: (symbols: string[], keys: ID) =>
      call(url, "ledger.balance", new Map([[1, symbols]]), keys),
    ledgerBurn: () => {},
    ledgerInfo: () => call(url, "ledger.info"),
    ledgerMint: () => {},
    ledgerSend: (to: ID, from: ID, amount: bigint, symbol: string) =>
      call(
        url,
        "ledger.send",
        new Map<number, any>([
          [1, to],
          [2, amount],
          [3, symbol],
        ]),
        from
      ),
  };
}

function call(url: string, method: string, args?: any, keys?: ID) {
  return send(url, { method, data: args }, keys);
}
