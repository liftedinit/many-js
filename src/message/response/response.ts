import { decodeFirstSync, Tagged } from "cbor-web";
import { mapToObj, Transform } from "../../shared/transform";
import { Result, Ok, Err } from "../../shared/result";
import { CborData, CborMap, CoseSign1 } from "../encoding";
import { ManyError } from "../error";
import { Message } from "../message";
import { bytesToHex, bytesToStr } from "../../shared/utils";

type AsyncAttr = [1, CborData];

interface ResponseObj {
  version?: number;
  from: string;
  to?: string;
  result: Result<any, ManyError>;
  timestamp?: number;
  id?: number;
  nonce?: string;
  attrs?: unknown[];
}

const responseMap: Transform = {
  0: "version",
  1: ["from", { fn: bytesToStr }],
  2: [
    "to",
    { fn: (value?: CborData) => (value ? bytesToStr(value) : undefined) },
  ],
  4: [
    "result",
    {
      fn: (value: any) =>
        typeof value === "object" && !(value instanceof Uint8Array)
          ? Err(new ManyError(Object.fromEntries(value)))
          : Ok(decodeFirstSync(value)),
    },
  ],
  5: ["timestamp", { fn: (value: Tagged) => value.value }],
  6: "id",
  7: ["nonce", { fn: bytesToHex }],
  8: "attrs",
};

const decoders = {
  tags: {
    10000: (value: CborData) => value,
    1: (value: number) => new Tagged(1, value),
  },
};

export class Response extends Message {
  constructor(public content: CborMap) {
    super(content);
  }

  get token(): CborData | undefined {
    const { attrs } = this.toJSON();
    if (!attrs) {
      return;
    }
    return (
      attrs?.find((attr) => Array.isArray(attr) && attr[0] === 1) as AsyncAttr
    )[1];
  }

  get result(): Result<any, ManyError> {
    const { result } = this.toJSON();
    return result;
  }

  toJSON(): ResponseObj {
    return mapToObj(this.content, responseMap);
  }

  static fromCoseSign1(cose: CoseSign1): Response {
    return new Response(cose.payload);
  }

  static fromCborData(data: CborData): Response {
    const cose = CoseSign1.fromCborData(data);
    return Response.fromCoseSign1(cose);
  }
}
