export function setupModule<M>(module: M, callImpl?: jest.Mock) {
  const mockCall = callImpl ?? jest.fn()
  return {
    call: mockCall,
    ...module,
  }
}
