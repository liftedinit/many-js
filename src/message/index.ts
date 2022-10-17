import cbor from "cbor";
import { Address, Identity } from "../identity"
import { CborData, CborMap, tag } from "./cbor";
import { CoseMessage, decoders } from "./cose";
import { ManyError, SerializedManyError } from "./error";
import { Attributes, AsyncAttribute } from "./attributes"

interface MessageContent {
  version?: number;
  from?: Address
  to?: Address
  method: string;
  data?: any;
  timestamp?: number;
  id?: number;
  nonce?: string;
  attrs?: string[];
}

export class Message {
  private content: CborMap
  constructor(content: CborMap) {
    this.content = content
  }

  getContent() {
    return this.content
  }

  getAsyncToken(): ArrayBuffer | undefined {
    const attributes = Attributes.getFromMessage(this)
    return attributes
      ? AsyncAttribute.getFromAttributes(attributes)?.getToken()
      : undefined
  }

  getPayload(): CborMap {
    return cbor.decode(this.content?.get(4), decoders)
  }

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
    if (obj.data) {
      content.set(4, cbor.encode(obj.data));
    }
    content.set(
      5,
      tag(1, obj.timestamp ? obj.timestamp : Math.floor(Date.now() / 1000))
    );
    if (obj.id) {
      content.set(6, obj.id);
    }
    if (obj.nonce) {
      content.set(7, cbor.encode(obj.nonce))
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

  toCoseMessage(identity?: Identity) {
    return CoseMessage.fromMessage(this, identity)
  }

  async toCborData(identity?: Identity) {
    return (await this.toCoseMessage(identity)).toCborData()
  }

  toString() {
    return JSON.stringify(this.content, this.replacer, 2);
  }
}
