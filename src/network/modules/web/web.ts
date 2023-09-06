import { Message } from "../../../message"
import { tag } from "../../../message/cbor"
import { makeRandomBytes } from "../../../utils"
import {
  WebDeployInfo,
  WebDeployParams, WebInfo, WebListParam,
  WebModule, WebRemoveParam, WebDeployInfoList,
} from "./types"

export const Web: WebModule = {
  _namespace_: "web",
  async info(): Promise<WebInfo> {
    const res = this.call("web.info")
    return getWebInfo(res)
  },

  async list(params: WebListParam): Promise<WebDeployInfoList> {
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
  data.set(3, params.deploymentSource)
  params.memo && data.set(4, params.memo)
  return data
}

function makeWebListData(params: WebListParam) {
  const data = new Map()
  params.order && data.set(0, params.order)
  params.filter && data.set(1, params.filter)
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
  const result: WebDeployInfo = {
    owner: data.get(0),
    siteName: data.get(1),
    siteDescription: data.get(2),
    deploymentUrl: data.get(3),
  }
  return result
}

function getWebInfo(message: Message): WebInfo {
  const data = message.getPayload()
  const result: WebInfo = {
    hash: Buffer.from(data.get(0)).toString("hex")
  }
  return result
}

function getWebList(message: Message): WebDeployInfoList {
  const data = message.getPayload()
  const result: WebDeployInfoList = {
    list: data.get(0),
  }
  return result
}