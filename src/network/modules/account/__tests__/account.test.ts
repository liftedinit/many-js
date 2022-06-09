import { Address } from "../../../../identity"
import {
  AccountFeature,
  AccountFeatureTypes,
  AccountMultisigArgument,
  AccountRole,
  LedgerTransactionType,
} from "../../types"
import {
  accountSource,
  Address2,
  identityStr1,
  identityStr2,
  identityStr3,
  makeLedgerSendParamResponse,
  makeMockResponseMessage,
  setupModule,
  txnSymbolAddress1,
} from "../../test/test-utils"
import { Account } from "../account"
import { makeLedgerSendParam } from "../../../../utils"
import { ONE_MINUTE, transactionTypeIndices } from "../../../../const"
import { tag } from "../../../../message/cbor"

describe("Account", () => {
  it("info() should return accountInfo", async () => {
    const accountName = "my-account"
    const roles = new Map()
    roles.set(identityStr2, [AccountRole.owner, AccountRole.canMultisigSubmit])
    roles.set(identityStr1, [AccountRole.canMultisigApprove])
    roles.set(identityStr3, [AccountRole.canMultisigApprove])
    const _roles = Array.from(roles).reduce((acc, rolesForAddress) => {
      const [address, roleList] = rolesForAddress
      const bytes = Address.fromString(address).toBuffer()
      acc.set({ value: bytes }, roleList)
      return acc
    }, new Map())
    const features: AccountFeature[] = [
      [
        AccountFeatureTypes.accountMultisig,
        // @ts-ignore
        new Map([
          [AccountMultisigArgument.threshold, 2],
          [AccountMultisigArgument.execute_automatically, false],
          [AccountMultisigArgument.timeout_in_secs, 86400],
        ]),
      ],
    ]
    const content = new Map()
    content.set(0, accountName).set(1, _roles).set(2, features)
    const mockCall = jest.fn(async () => {
      return makeMockResponseMessage(content)
    })
    const account = setupModule(Account, mockCall)
    const res = await account.info("m123")
    expect(mockCall).toHaveBeenCalledTimes(1)
    expect(mockCall).toHaveBeenCalledWith(
      "account.info",
      new Map([[0, "m123"]]),
    )
    expect(res).toEqual({
      accountInfo: {
        name: accountName,
        roles,
        features: new Map([
          [
            AccountFeatureTypes[1],
            //@ts-ignore
            new Map([
              [AccountMultisigArgument[0], 2],
              [AccountMultisigArgument[1], 86400],
              [AccountMultisigArgument[2], false],
            ]),
          ],
        ]),
      },
    })
  })

  it("should submit multisig transactions", async () => {
    const resMultisigToken = new Uint8Array()
    const mockCall = jest.fn(async () => {
      return makeMockResponseMessage(new Map().set(0, resMultisigToken))
    })
    const account = setupModule(Account, mockCall)
    const txnData = {
      amount: BigInt(1),
      to: "m123",
      from: "m321",
      symbol: "m456",
      memo: "this is a memo",
    }

    const res = await account.submitMultisigTxn(
      LedgerTransactionType.send,
      txnData,
    )

    const expectedCallArgs = new Map()
      .set(0, txnData.from)
      .set(1, txnData.memo)
      .set(
        2,
        new Map()
          .set(0, transactionTypeIndices[LedgerTransactionType.send])
          .set(1, makeLedgerSendParam(txnData)),
      )
    expect(mockCall).toHaveBeenCalledWith(
      "account.multisigSubmitTransaction",
      expectedCallArgs,
    )
    expect(res).toEqual({ token: resMultisigToken })
  })

  it("multisigInfo() should return info about the multisig transaction", async () => {
    const timeout = new Date(new Date().getTime() + ONE_MINUTE)
    const mockCall = jest.fn(async () => {
      return makeMockResponseMessage(makeMultisigInfoResponse({ timeout }))
    })
    const account = setupModule(Account, mockCall)

    const res = await account.multisigInfo(new ArrayBuffer(0))
    expect(mockCall).toHaveBeenCalledWith(
      "account.multisigInfo",
      new Map().set(0, new ArrayBuffer(0)),
    )
    expect(res).toEqual({
      info: {
        memo: "this is a memo",
        transaction: {
          type: LedgerTransactionType.send,
          from: accountSource,
          to: identityStr1,
          symbolAddress: txnSymbolAddress1,
          amount: BigInt(2),
        },
        submitter: identityStr2,
        approvers: [{ address: identityStr2, hasApproved: true }],
        threshold: 2,
        execute_automatically: false,
        timeout,
        cborData: null,
      },
    })
  })
})

function makeMultisigInfoResponse({ timeout }: { timeout: Date }) {
  const accountMultisigTxn = new Map().set(0, transactionTypeIndices.send).set(
    1,
    makeLedgerSendParamResponse({
      source: accountSource,
      destination: identityStr1,
      symbol: txnSymbolAddress1,
      amount: 2,
    }),
  )
  const submitter = tag(10000, Address2)
  const approvers = new Map().set(submitter, new Map().set(0, true))
  const threshold = 2
  const execute_automatically = false
  return new Map()
    .set(0, "this is a memo")
    .set(1, accountMultisigTxn)
    .set(2, submitter)
    .set(3, approvers)
    .set(4, threshold)
    .set(5, execute_automatically)
    .set(6, timeout)
    .set(7, null)
}
