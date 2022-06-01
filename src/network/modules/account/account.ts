import { Address } from "../../../identity"
import { Message } from "../../../message"
import {
  AccountFeature,
  AccountFeatureTypes,
  AccountInfoPayloadResponseLabels,
  AccountMultisigArgument,
  IAccount,
} from "../types"

export const Account: IAccount = {
  _namespace_: "account",

  async info(accountId: string): Promise<unknown> {
    const message = await this.call("account.info", new Map([[0, accountId]]))
    return getAccountInfo(message)
  },
}

type AccountInfoData =
  | {
      name: string
      roles: ReturnType<typeof getAccountInfoRolesData>
      features: ReturnType<typeof getAccountInfoFeaturesData>
    }
  | undefined
function getAccountInfo(message: Message): {
  accountInfo: AccountInfoData
} {
  let result: { accountInfo: AccountInfoData } = {
    accountInfo: undefined,
  }
  const payload = message.getPayload()
  if (payload instanceof Map) {
    result.accountInfo = {
      name: payload.get(AccountInfoPayloadResponseLabels.name),
      roles: getAccountInfoRolesData(
        payload?.get?.(AccountInfoPayloadResponseLabels.roles),
      ),
      features: getAccountInfoFeaturesData(
        payload?.get?.(AccountInfoPayloadResponseLabels.features),
      ),
    }
  }
  return result
}

function getAccountInfoRolesData(
  roles: Map<{ value: Uint8Array }, string[]> = new Map(),
): Map<string, string[]> | undefined {
  return Array.from(roles).reduce((acc, roleData) => {
    const [identity, roleList] = roleData
    const i = identity as { value: Uint8Array }
    const address = new Address(Buffer.from(i.value)).toString()
    acc.set(address, roleList)
    return acc
  }, new Map())
}

function getAccountInfoFeaturesData(
  features: AccountFeature[] = [],
): Map<AccountFeatureTypes, boolean | unknown> {
  return features.reduce((acc, feature) => {
    let featureName
    let featureValue
    let featureLabelNum
    if (Array.isArray(feature)) {
      const [featureLabelNum, featureArguments] = feature as [number, unknown]
      featureName = AccountFeatureTypes[featureLabelNum]
      featureValue = makeAccountFeatureArgumentData(
        featureLabelNum,
        featureArguments as Map<number, unknown>,
      )
    } else if (typeof feature === "number") {
      featureLabelNum = feature
      featureName = AccountFeatureTypes[feature]
      featureValue = true
    }
    if (!featureName && featureLabelNum)
      console.error("Account feature not implemented:", featureLabelNum)
    if (featureName && featureValue) acc.set(featureName, featureValue)
    return acc
  }, new Map())
}

function makeAccountFeatureArgumentData(
  feature: number,
  argumentData: Map<number, unknown> = new Map(),
): Map<AccountMultisigArgument, unknown> | undefined {
  if (feature === AccountFeatureTypes.accountMultisig) {
    return Array.from(argumentData).reduce((acc, argData) => {
      const [argLabelNum, value] = argData
      const argName = AccountMultisigArgument[argLabelNum]
      if (!argName) {
        console.error(
          "Account multisig feature argument not found:",
          argLabelNum,
        )
        return acc
      } else acc.set(argName, value)
      return acc
    }, new Map())
  }
}
