import cbor from "cbor";
import Tagged from "cbor/types/lib/tagged";
import { v4 as uuidv4 } from "uuid";

import { calculateKid, encodeEnvelope, getPayload } from "./cose";
import * as identity from "./identity";
import { objToMap } from "./utils";

import { Key, Identity as ID } from "./identity";

const ANONYMOUS = Buffer.from([0x00]);

export type Cbor = Buffer;

export interface Message {
  data?: any;
  from?: string;
  id?: number | string;
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

export function encode(message: Message, keys: ID = null): Cbor {
  const publicKey = keys ? keys.publicKey : ANONYMOUS;
  const payload = makePayload(message, publicKey);
  const envelope = encodeEnvelope(payload, keys);
  return envelope;
}

export function decode(cbor: Cbor) {
  const payload = getPayload(cbor);
  return (payload as Cose).value["4"];
}

function makePayload(
  { to, from, method, data, version, timestamp }: Message,
  publicKey: Key
): Payload {
  if (!method) {
    throw new Error("Property 'method' is required.");
  }
  const payload = new Map();
  payload.set(0, version ? version : 1);
  payload.set(1, from ? from : new cbor.Tagged(10000, calculateKid(publicKey)));
  payload.set(2, to ? to : identity.toString()); // ANONYMOUS
  payload.set(3, method);
  payload.set(4, cbor.encode(data ? data : new ArrayBuffer(0)));
  payload.set(
    5,
    new cbor.Tagged(1, timestamp ? timestamp : Math.floor(Date.now() / 1000))
  );
  return payload;
}

function reviver(key: string, value: any) {
  switch (true) {
    case typeof value === "string" && /^\d+n$/.test(value): // "1000n"
      return BigInt(value.slice(0, -1));

    default:
      return value;
  }
}

export function toJSON(buffer: Cbor): string {
  const cose = cbor.decodeAllSync(buffer);
  return JSON.stringify(cose, replacer, 2);
}

function replacer(key: string, value: any) {
  switch (true) {
    case value?.type === "Buffer": {
      // Cbor
      const buffer = Buffer.from(value.data);
      try {
        return cbor.decodeAllSync(buffer);
      } catch (e) {
        return buffer.toString("hex");
      }
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
