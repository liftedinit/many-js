export function makeRandomBytes(size = 32) {
  return crypto.getRandomValues(new Uint8Array(size));
}

export function h(str: TemplateStringsArray): Buffer {
  return Buffer.from(str[0], "hex");
  // return Uint8Array.from(
  //   str[0].match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)),
  // );
}
