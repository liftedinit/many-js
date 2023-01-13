import cbor from "cbor";

export type CborData = Buffer;
export type CborMap = Map<string | number, any>;

export function tag(tag: number, content: any) {
  return new cbor.Tagged(tag, content);
}
