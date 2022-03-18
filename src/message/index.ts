import cbor from "cbor";

import { Identity } from "../identity";
import { CborData, CborMap, tag } from "./cbor";
import { CoseMessage } from "./cose";
import { ManyError, SerializedManyError } from "./error";
import { KeyPair } from "../keys";

interface MessageContent {
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

export const DEFAULT_MESSAGE_DATA = cbor.encode(new ArrayBuffer(0));

export class Message {
  constructor(public content: CborMap) {}

  static fromObject(obj: MessageContent): Message {
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
    content.set(4, obj.data ? cbor.encode(obj.data) : DEFAULT_MESSAGE_DATA);
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
    return new Message(content);
  }

  static fromCoseMessage(message: CoseMessage): Message {
    const content = message.content;
    const data = content.get(4);
    if (typeof data == "object" && !Buffer.isBuffer(data)) {
      throw new ManyError(
        Object.fromEntries(data.entries()) as SerializedManyError
      );
    }
    return new Message(content);
  }

  static fromCborData(data: CborData): Message {
    const cose = CoseMessage.fromCborData(data);
    return Message.fromCoseMessage(cose);
  }

  private replacer(key: string, value: any) {
    if (value?.type === "Buffer") {
      return Buffer.from(value.data).toString("hex");
    } else if (value instanceof Map) {
      return Object.fromEntries(value.entries());
    } else if (typeof value === "bigint") {
      return parseInt(value.toString());
    } else if (key === "hash") {
      return Buffer.from(value).toString("hex");
    } else if (key === "bytes") {
      return Buffer.from(value).toString("hex");
    } else {
      return value;
    }
  }

  toCoseMessage(keys?: KeyPair) {
    return CoseMessage.fromMessage(this, keys);
  }

  toCborData(keys?: KeyPair) {
    return this.toCoseMessage(keys).toCborData();
  }

  toString() {
    return JSON.stringify(this.content, this.replacer, 2);
  }
}
