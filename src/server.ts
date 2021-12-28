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
    endpoints: () => send(url, { method: "endpoints" }),
    ledger_info: () => send(url, { method: "ledger.info" }),
    ledger_balance: (symbols: string[], keys: ID) =>
      send(url, { method: "ledger.balance", data: `[[1, ${symbols}]]` }, keys),
  };
}
