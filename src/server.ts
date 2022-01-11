import { Identity, toString } from "./identity";
import { KeyPair } from "./keys";
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
  keys?: KeyPair
): Promise<any> {
  const cbor = encode(message, keys);
  const reply = await sendEncoded(url, cbor);
  // @TODO: Verify response
  return decode(reply);
}

export function connect(url: string) {
  return {
    call: (method: string, args?: any, keys?: KeyPair) =>
      call(url, method, args, keys),

    // Base
    endpoints: (prefix?: string) => call(url, "endpoints", { prefix }),
    heartbeat: () => call(url, "heartbeat"),
    status: () => call(url, "status"),
    echo: (message: any) => call(url, "echo", message),

    // ABCI
    abciBeginBlock: () => {
      throw new Error("Not implemented");
    },
    abciCommit: () => {
      throw new Error("Not implemented");
    },
    abciEndBlock: () => {
      throw new Error("Not implemented");
    },
    abciInfo: () => {
      throw new Error("Not implemented");
    },
    abciInit: () => {
      throw new Error("Not implemented");
    },

    // Account
    accountBalance: (symbols: string[], keys: KeyPair) =>
      call(url, "account.balance", new Map([[1, symbols]]), keys),
    accountBurn: () => {
      throw new Error("Not implemented");
    },
    accountInfo: (keys: KeyPair) => call(url, "account.info", keys),
    accountMint: () => {
      throw new Error("Not implemented");
    },
    accountSend: (
      to: Identity,
      amount: bigint,
      symbol: string,
      keys: KeyPair
    ) =>
      call(
        url,
        "account.send",
        new Map<number, any>([
          [1, toString(to)],
          [2, amount],
          [3, symbol],
        ]),
        keys
      ),

    // Ledger
    ledgerInfo: () => call(url, "ledger.info"),
    ledgerList: () => {
      throw new Error("Not implemented");
    },
  };
}

function call(url: string, method: string, args?: any, keys?: KeyPair) {
  return send(url, { method, data: args }, keys);
}
