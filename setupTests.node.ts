//@ts-ignore
global.navigator = {
  //@ts-ignore
  credentials: {
    get: jest.fn(),
    create: jest.fn(),
    store: jest.fn(),
  },
};
