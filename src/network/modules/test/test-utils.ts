import cbor from "cbor"
import { Address } from "../../../identity"
import { Message } from "../../../message"
import { tag } from "../../../message/cbor"

export const accountSource =
  "mqdiclsquy3nnoioxg3zhsci2vltdhmlsmdlbhbaglf5rjtqaaabajj"
export const identityStr1 =
  "mqbfbahksdwaqeenayy2gxke32hgb7aq4ao4wt745lsfs6wiaaaaqnz"
export const Address1 = Address.fromString(identityStr1)
export const identityStr2 = "maffbahksdwaqeenayy2gxke32hgb7aq4ao4wt745lsfs6wijp"
export const Address2 = Address.fromString(identityStr2)
export const identityStr3 = "mahiclsquy3nnoioxg3zhsci2vltdhmlsmdlbhbaglf5rjtq6c"
export const Address3 = Address.fromString(identityStr3)

export const taggedIdentity1 = Address1
export const taggedIdentity2 = Address2
export const taggedIdentity3 = Address2
export const taggedAccountSource = Address.fromString(accountSource)

export const txnSymbolAddress1 =
  "mafw3bxrqe2jdcidvjlonloqcczvytrxr3fl4naybmign3uy6e"
export const txnSymbolAddress2 =
  "mafxombm6axwsrcvymht5ss3chlpbks7sp7dvl2v7chnuzkyfj"

export function setupModule<M>(module: M, callImpl?: jest.Mock) {
  const mockCall = callImpl ?? jest.fn()
  return {
    call: mockCall,
    ...module,
  }
}

export function makeMockResponseMessage(responseData: unknown) {
  const content = new Map([[4, cbor.encode(responseData)]])

  return new Message(content)
}

export function makeLedgerSendParamResponse({
  source,
  destination,
  amount,
  symbol,
}: {
  source: string
  destination: string
  amount: number
  symbol: string
}) {
  return new Map()
    .set(0, Address.fromString(source))
    .set(1, Address.fromString(destination))
    .set(2, amount)
    .set(3, Address.fromString(symbol))
}
