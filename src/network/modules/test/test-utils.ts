import cbor from "cbor"
import { Address } from "../../../identity"
import { Message } from "../../../message/message"
import { tag } from "../../../message/encoding"

export const accountSource =
  "mqdiclsquy3nnoioxg3zhsci2vltdhmlsmdlbhbaglf5rjtqaaabajj"
export const identityStr1 =
  "mqbfbahksdwaqeenayy2gxke32hgb7aq4ao4wt745lsfs6wiaaaaqnz"
export const Address1 = Address.fromString(identityStr1).toBuffer()
export const identityStr2 = "maffbahksdwaqeenayy2gxke32hgb7aq4ao4wt745lsfs6wijp"
export const Address2 = Address.fromString(identityStr2).toBuffer()
export const identityStr3 = "mahiclsquy3nnoioxg3zhsci2vltdhmlsmdlbhbaglf5rjtq6c"
export const Address3 = Address.fromString(identityStr3).toBuffer()

export const taggedIdentity1 = tag(10000, Address1)
export const taggedIdentity2 = tag(10000, Address2)
export const taggedIdentity3 = tag(10000, Address2)
export const taggedAccountSource = tag(
  10000,
  Address.fromString(accountSource).toBuffer(),
)

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
    .set(0, tag(10000, Address.fromString(source).toBuffer()))
    .set(1, tag(10000, Address.fromString(destination).toBuffer()))
    .set(2, amount)
    .set(3, tag(10000, Address.fromString(symbol).toBuffer()))
}
