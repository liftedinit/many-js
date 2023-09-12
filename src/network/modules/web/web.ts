import { Message } from "../../../message"
import { tag } from "../../../message/cbor"
import { makeRandomBytes } from "../../../utils"
import { WebDeployInfo, WebDeployParams, WebInfo, WebListParam, WebModule, WebRemoveParam } from "./types"

export const Web: WebModule = {
  _namespace_: "web",
  async info(): Promise<WebInfo> {
    const res = this.call("web.info")
    return getWebInfo(res)
  },

  async list(params: WebListParam): Promise<WebDeployInfo[]> {
    const res = await this.call("web.list", makeWebListData(params))
    return getWebList(res)
  },

  async deploy(
    params: WebDeployParams,
    { nonce } = { nonce: makeRandomBytes(16) },
  ): Promise<WebDeployInfo> {
    const res = await this.call("web.deploy", makeWebDeployData(params), { nonce })
    return getWebDeploy(res)
  },

  async remove(params: WebRemoveParam,
               { nonce } = { nonce: makeRandomBytes(16) },
  ) {
    await this.call("web.remove", makeWebRemoveData(params), { nonce })
  },
}

function makeWebDeployData(params: WebDeployParams) {
  const data = new Map()
  params.owner && data.set(0, tag(10000, params.owner))
  data.set(1, params.siteName)
  params.siteDescription && data.set(2, params.siteDescription)
  data.set(3, params.deploymentSource.payload)
  params.memo && data.set(4, params.memo)
  return data
}

function makeWebListData(params: WebListParam) {
  const data = new Map()
  params.count && data.set(0, params.count)
  params.order && data.set(1, params.order)
  params.filters && data.set(2, params.filters.map(filter => filter.payload))
  return data
}

function makeWebRemoveData(params: WebRemoveParam) {
  const data = new Map()
  params.owner && data.set(0, tag(10000, params.owner))
  data.set(1, params.siteName)
  params.memo && data.set(2, params.memo)
  return data
}

function getWebDeploy(message: Message): WebDeployInfo {
  const data = message.getPayload()
  return {
    owner: data.get(0).get(0),
    siteName: data.get(0).get(1),
    siteDescription: data.get(0).get(2) ?? undefined,
    deploymentUrl: data.get(0).get(3),
  }
}

function getWebInfo(message: Message): WebInfo {
  const data = message.getPayload()
  return {
    hash: Buffer.from(data.get(0)).toString("hex"),
  }
}

function getWebList(message: Message): WebDeployInfo[] {
  const convertMapToWebDeployInfo = (map: Map<number, any>): WebDeployInfo => {
    return {
      owner: map.get(0),
      siteName: map.get(1),
      siteDescription: map.get(2),
      deploymentUrl: map.get(3),
    }
  }
  const data = message.getPayload()
  return data.get(0).map(convertMapToWebDeployInfo)
}