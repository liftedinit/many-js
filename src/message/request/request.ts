import cbor from "cbor";
import { mapToObj, objToMap, Transform } from "../../shared/transform";
import { Message } from "../message";
import { CoseSign1 } from "../encoding";
import Tagged from "cbor/types/lib/tagged";

export interface RequestArgs {
  version?: number;
  from?: string;
  to?: string;
  method: string;
  data?: any;
  timestamp?: number;
  id?: number;
  nonce?: string;
  attrs?: string[];
}

const requestArgMap: Transform = {
  0: "version",
  1: "from",
  2: "to",
  3: "method",
  4: [
    "data",
    {
      fn: (value?: Buffer) =>
        value ? cbor.decode(value, decoders) : undefined,
    },
  ],
  5: ["timestamp", { fn: (value: Tagged) => value.value }],
  6: "id",
  7: ["nonce", { fn: (value: Buffer) => value.toString("hex") }],
  8: "attrs",
};

const requestMap: Transform = {
  0: "version",
  1: "from",
  2: "to",
  3: "method",
  4: [
    "data",
    { fn: (value?: any) => (value ? cbor.encode(value) : undefined) },
  ],
  5: ["timestamp", { fn: (value: number) => new cbor.Tagged(1, value) }],
  6: "id",
  7: ["nonce", { fn: (value: string) => cbor.encode(value) }],
  8: "attrs",
};

const decoders = {
  tags: {
    10000: (value: Uint8Array) => Buffer.from(value),
    1: (value: number) => new cbor.Tagged(1, value),
  },
};

export class Request extends Message {
  toJSON(): RequestArgs {
    return mapToObj(this.content, requestArgMap);
  }

  static fromObject(obj: RequestArgs): Request {
    if (!obj.method) {
      throw new Error("Property 'method' is required.");
    }
    const defaults = {
      version: 1,
      timestamp: Math.floor(Date.now() / 1000),
    };
    return new Request(objToMap({ ...defaults, ...obj }, requestMap));
  }

  static fromCoseSign1(cose: CoseSign1): Request {
    return new Request(cose.payload);
  }

  static fromBuffer(data: Buffer): Request {
    return Request.fromCoseSign1(CoseSign1.fromBuffer(data));
  }
}
