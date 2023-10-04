import { Message } from "../../../message"
import { makeRandomBytes } from "../../../utils"
import {
  WebDeployInfo,
  WebDeployParams,
  WebInfo,
  WebListParams,
  WebListReturns,
  WebModule,
  WebRemoveParams,
  WebUpdateParams,
} from "./types"

export const Web: WebModule = {
  _namespace_: "web",
  async info(): Promise<WebInfo> {
    const res = await this.call("web.info")
    return getWebInfo(res)
  },

  async list(params: WebListParams): Promise<WebListReturns> {
    const res = await this.call("web.list", makeWebListData(params))
    return getWebList(res)
  },

  async deploy(
    params: WebDeployParams,
    { nonce } = { nonce: makeRandomBytes(16) },
  ): Promise<WebDeployInfo> {
    const res = await this.call("web.deploy", makeWebDeployData(params), {
      nonce,
    })
    return getWebDeploy(res)
  },

  async remove(
    params: WebRemoveParams,
    { nonce } = { nonce: makeRandomBytes(16) },
  ) {
    await this.call("web.remove", makeWebRemoveData(params), { nonce })
  },

  async update(
    params: WebUpdateParams,
    { nonce } = { nonce: makeRandomBytes(16) },
  ): Promise<WebDeployInfo> {
    const res = await this.call("web.update", makeWebUpdateData(params), {
      nonce,
    })
    return getWebUpdate(res)
  },
}

function setIfDefined(data: Map<number, any>, key: number, value: any) {
  if (value) data.set(key, value)
}

function makeWebDeployData(params: WebDeployParams) {
  const OWNER_KEY = 0
  const SITE_NAME_KEY = 1
  const SITE_DESCRIPTION_KEY = 2
  const DEPLOYMENT_SOURCE_KEY = 3
  const MEMO_KEY = 4
  const DOMAIN_KEY = 5

  const data = new Map()
  setIfDefined(data, OWNER_KEY, params.owner)
  setIfDefined(data, SITE_NAME_KEY, params.siteName)
  setIfDefined(data, SITE_DESCRIPTION_KEY, params.siteDescription)
  setIfDefined(data, DEPLOYMENT_SOURCE_KEY, params.deploymentSource.payload)
  setIfDefined(data, MEMO_KEY, params.memo)
  setIfDefined(data, DOMAIN_KEY, params.domain)
  return data
}

function makeWebUpdateData(params: WebUpdateParams) {
  return makeWebDeployData(params)
}

function makeWebListData(params: WebListParams) {
  const COUNT_KEY = 0
  const ORDER_KEY = 1
  const FILTERS_KEY = 2

  const data = new Map()
  setIfDefined(data, COUNT_KEY, params.count)
  setIfDefined(data, ORDER_KEY, params.order)
  setIfDefined(data, FILTERS_KEY, params.filters?.map(filter => filter.payload))
  return data
}

function makeWebRemoveData(params: WebRemoveParams) {
  const OWNER_KEY = 0
  const SITE_NAME_KEY = 1
  const MEMO_KEY = 2

  const data = new Map()
  setIfDefined(data, OWNER_KEY, params.owner)
  setIfDefined(data, SITE_NAME_KEY, params.siteName)
  setIfDefined(data, MEMO_KEY, params.memo)
  return data
}

function getWebDeploy(message: Message): WebDeployInfo {
  const WEB_DEPLOY_INFO_KEY = 0
  const OWNER_KEY = 0
  const SITE_NAME_KEY = 1
  const SITE_DESCRIPTION_KEY = 2
  const DEPLOYMENT_URL_KEY = 3
  const DOMAIN_KEY = 4

  const data = message.getPayload()
  return {
    owner: data.get(WEB_DEPLOY_INFO_KEY).get(OWNER_KEY),
    siteName: data.get(WEB_DEPLOY_INFO_KEY).get(SITE_NAME_KEY),
    siteDescription:
      data.get(WEB_DEPLOY_INFO_KEY).get(SITE_DESCRIPTION_KEY) ?? undefined,
    deploymentUrl: data.get(WEB_DEPLOY_INFO_KEY).get(DEPLOYMENT_URL_KEY),
    domain: data.get(WEB_DEPLOY_INFO_KEY).get(DOMAIN_KEY) ?? undefined,
  }
}

function getWebUpdate(message: Message): WebDeployInfo {
  return getWebDeploy(message)
}

function getWebInfo(message: Message): WebInfo {
  const WEB_INFO_KEY = 0

  const data = message.getPayload()
  return {
    hash: Buffer.from(data.get(WEB_INFO_KEY)).toString("hex"),
  }
}

function getWebList(message: Message): WebListReturns {
  const WEB_DEPLOY_LIST_KEY = 0
  const OWNER_KEY = 0
  const SITE_NAME_KEY = 1
  const SITE_DESCRIPTION_KEY = 2
  const DEPLOYMENT_URL_KEY = 3
  const DOMAIN_KEY = 4
  const TOTAL_COUNT_KEY = 1

  const convertMapToWebDeployInfo = (map: Map<number, any>): WebDeployInfo => {
    return {
      owner: map.get(OWNER_KEY),
      siteName: map.get(SITE_NAME_KEY),
      siteDescription: map.get(SITE_DESCRIPTION_KEY),
      deploymentUrl: map.get(DEPLOYMENT_URL_KEY),
      domain: map.get(DOMAIN_KEY),
    }
  }
  const data = message.getPayload()
  const deployments = data
    .get(WEB_DEPLOY_LIST_KEY)
    .map(convertMapToWebDeployInfo)

  return {
    deployments,
    totalCount: data.get(TOTAL_COUNT_KEY),
  }
}
