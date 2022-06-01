import cbor from "cbor"
import { Address } from "../../../../identity"
import { Message } from "../../../../message"
import {
  AccountFeature,
  AccountFeatureTypes,
  AccountMultisigArgument,
  AccountRole,
} from "../../types"
import { setupModule } from "../../test/test-utils"
import { Account } from "../account"

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
    const mockCall = jest.fn(async () => {
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
      return makeResponseMessage(accountName, roles, features)
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
})

function makeResponseMessage(
  accountName: string,
  roles: Map<string, AccountRole[]>,
  features: AccountFeature[],
) {
  const _roles = Array.from(roles).reduce((acc, rolesForAddress) => {
    const [address, roleList] = rolesForAddress
    const bytes = Address.fromString(address).toBuffer()
    acc.set({ value: bytes }, roleList)
    return acc
  }, new Map())

  const mockLedgerInfoResponseContent = new Map([
    [
      4,
      cbor.encode(
        //@ts-ignore
        new Map([
          [0, accountName],
          [1, _roles],
          [2, features],
        ]),
      ),
    ],
  ])

  return new Message(mockLedgerInfoResponseContent)
}

function makeRole(address: string, roles: AccountRole[]) {
  const m = new Map()
  m.set(address, roles)
  return m
}
