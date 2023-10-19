import { encode, decodeAllSync, Tagged } from "cbor-web";
import { mapToObj, objToMap, Transform } from "../../shared/transform";
import { Message } from "../message";
import { CborData, cborDataToString, CoseSign1 } from "../encoding";
import { makeRandomBytes } from "../../shared/utils";
import { Identifier } from "../../id";

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
      fn: (value?: CborData) => (value ? decodeAllSync(value) : undefined),
    },
  ],
  5: [
    "timestamp",
    {
      fn: (value: Date | Tagged) =>
        value instanceof Date ? value.valueOf() : value.value,
    },
  ],
  6: "id",
  7: ["nonce", { fn: (value: CborData) => cborDataToString(value, "hex") }],
  8: "attrs",
};

const requestMap: Transform = {
  0: "version",
  1: "from",
  2: "to",
  3: "method",
  4: ["data", { fn: (value?: any) => (value ? encode(value) : undefined) }],
  5: [
    "timestamp",
    {
      fn: (value: number) => new Tagged(1, value),
    },
  ],
  6: "id",
  // 7: ["nonce", { fn: (value: string) => cbor.encode(value) }],
  8: "attrs",
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
      // version: 1,
      timestamp: Math.floor(Date.now() / 1000),
      // nonce: makeRandomBytes(16),
    };
    return new Request(objToMap({ ...defaults, ...obj }, requestMap));
  }

  static fromCoseSign1(cose: CoseSign1): Request {
    return new Request(cose.payload);
  }

  static fromCborData(data: CborData): Request {
    const cose = CoseSign1.fromCborData(data);
    return Request.fromCoseSign1(cose);
  }
}
