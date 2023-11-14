import { TextEncoder, TextDecoder } from "util";

global.TextEncoder = TextEncoder;
(global as any).TextDecoder = TextDecoder;

//@ts-ignore
global.navigator.credentials = {
  get: jest.fn(),
  create: jest.fn(),
  store: jest.fn(),
};
