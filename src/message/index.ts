import cbor from "cbor";
import { KeyPair } from "../keys";
import { Identity } from "../identity";

import { CborData, CborMap, tag } from "./cbor";
import { encodeEnvelope, getPayload } from "./cose";

interface ManyMessageContent {
  version?: number;
  from?: Identity;
  to?: Identity;
  method: string;
  data?: any;
  timestamp?: number;
  id?: number;
  nonce?: string;
  attrs?: string[];
}

export class ManyMessage {
  constructor(public content: CborMap) {}

  toString() {
    return JSON.stringify(this.content, replacer, 2);
  }
}

export class ManyRequest extends ManyMessage {
  static fromObject(obj: ManyMessageContent): ManyMessage {
    if (!obj.method) {
      throw new Error("Property 'method' is required.");
    }
    const content = new Map();
    content.set(0, obj.version ? obj.version : 1);
    if (obj.from) {
      content.set(1, obj.from.toString());
    }
    if (obj.to) {
      content.set(2, obj.to.toString());
    }
    content.set(3, obj.method);
    content.set(4, obj.data ? obj.data : cbor.encode(new ArrayBuffer(0)));
    content.set(
      5,
      tag(1, obj.timestamp ? obj.timestamp : Math.floor(Date.now() / 1000))
    );
    if (obj.id) {
      content.set(6, obj.id);
    }
    if (obj.nonce) {
      content.set(7, obj.nonce);
    }
    if (obj.attrs) {
      content.set(8, obj.attrs);
    }
    return new ManyRequest(content);
  }
}

export class ManyResponse extends ManyMessage {}

// --------------------------------------------------------------------------------

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
  const sender = keys ? Identity.fromPublicKey(keys.publicKey) : undefined;
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
  const senderIdentity = sender ? sender : new Identity(); // ANONYMOUS
  payload.set(0, version ? version : 1);
  payload.set(1, from ? from : senderIdentity.toString());
  payload.set(2, to ? to : new Identity().toString()); // ANONYMOUS
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
