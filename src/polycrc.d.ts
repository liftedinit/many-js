declare module "polycrc" {
  export function crc8(bytes: Buffer): string;
  export function crc16(bytes: Buffer): string;
  export function crc32(bytes: Buffer): string;
}
