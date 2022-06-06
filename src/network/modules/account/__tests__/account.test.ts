import { Address } from "../../../../identity"
import {
  AccountFeature,
  AccountFeatureTypes,
  AccountMultisigArgument,
  AccountRole,
  LedgerTransactionType,
} from "../../types"
import { makeMockResponseMessage, setupModule } from "../../test/test-utils"
import { Account } from "../account"
import { makeLedgerSendParam } from "../../../../utils"
import { transactionTypeIndices } from "../../../../const"

describe("Account", () => {
  it("info() should return accountInfo", async () => {
    const accountName = "my-account"
    const roles = new Map()
    roles.set("maffbahksdwaqeenayy2gxke32hgb7aq4ao4wt745lsfs6wijp", [
      AccountRole.owner,
      AccountRole.canMultisigSubmit,
    ])
    roles.set("maf7sbcv2z72aa5idufayhphb5cxkong3munpbgpqz4hykbah4", [
      AccountRole.canMultisigApprove,
    ])
    roles.set("mahiclsquy3nnoioxg3zhsci2vltdhmlsmdlbhbaglf5rjtq6c", [
      AccountRole.canMultisigApprove,
    ])
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

  it("should submit multig transactions", async () => {
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
})
