import cbor from "cbor";

import { encodeEnvelope, getPayload } from "./cose";
import * as identity from "./identity";

import { KeyPair } from "./keys";
import { Identity } from "./identity";

export type Cbor = Buffer;

export interface Message {
  data?: any;
  from?: string;
  method: string;
  timestamp?: number;
  to?: string;
  version?: number;
}

export type Payload = Map<number, any>;

export interface Cose {
  tag: number;
  value: { 4: any };
  err: number[];
}

export function encode(message: Message, keys?: KeyPair): Cbor {
  const sender = keys ? identity.fromPublicKey(keys.publicKey) : undefined;
  const payload = makePayload(message, sender);
  const envelope = encodeEnvelope(payload, keys);
  return envelope;
}

export function decode(cbor: Cbor): any {
  const payload = getPayload(cbor) as any;
  return payload ? payload["4"] : {};
}

function makePayload(
  { to, from, method, data, version, timestamp }: Message,
  sender?: Identity
): Payload {
  if (!method) {
    throw new Error("Property 'method' is required.");
  }
  const now = Math.floor(Date.now() / 1000);
  const payload = new Map();
  payload.set(0, version ? version : 1);
  payload.set(1, from ? from : identity.toString(sender));
  payload.set(2, to ? to : identity.toString()); // ANONYMOUS
  payload.set(3, method);
  payload.set(4, cbor.encode(data ? data : new ArrayBuffer(0)));
  payload.set(5, new cbor.Tagged(1, timestamp ? timestamp : now));
  return payload;
}

export function toJSON(cbor: Cbor): string {
  const cose = getPayload(cbor) as any;
  return JSON.stringify(cose, replacer, 2);
}

function replacer(key: string, value: any) {
  switch (true) {
    case value?.type === "Buffer": {
      return Buffer.from(value.data).toString("hex");
    }

    case value instanceof Map: // Map()
      return Object.fromEntries(value.entries());

    case typeof value === "bigint": // BigInt()
      return parseInt(value.toString());

    case key === "hash": // { hash: [0,1,2] }
      return Buffer.from(value).toString("hex");

    default:
      return value;
  }
}
