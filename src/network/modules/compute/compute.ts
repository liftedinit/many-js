import {Message} from "../../../message"
import {makeRandomBytes} from "../../../utils"
import {
  ComputeCloseParam,
  ComputeDeployParam,
  ComputeInfo,
  ComputeListParam,
  ComputeModule,
  DeploymentList,
} from "./types"

export const Compute: ComputeModule = {
  _namespace_: "compute",
  async info(): Promise<ComputeInfo> {
    const res = await this.call("compute.info")
    return getComputeInfo(res)
  },
  async deploy(
    param: ComputeDeployParam,
    { nonce } = { nonce: makeRandomBytes(16) },
  ) {
    const data = makeComputeDeployData(param)
    await this.call("compute.deploy", data, { nonce })
  },
  async close(
    param: ComputeCloseParam,
    { nonce } = { nonce: makeRandomBytes(16) },
  ) {
    const data = makeComputeCloseData(param)
    await this.call("compute.close", data, { nonce })
  },
  async list(param: ComputeListParam): Promise<DeploymentList> {
    const data = makeComputeListData(param)
    const res = await this.call("compute.list", data)
    return getDeploymentList(res)
  },
 }

function makeComputeDeployData(param: ComputeDeployParam): Map<number, any> {
  const data = new Map()
  data.set(0, param.image)
  data.set(1, param.port)
  data.set(2, param.num_cpu)
  data.set(3, param.num_memory)
  data.set(4, param.memory_type)
  data.set(5, param.num_storage)
  data.set(6, param.storage_type)
  data.set(7, param.region)
  return data
}

function makeComputeCloseData(param: ComputeCloseParam): Map<number, any> {
  const data = new Map()
  data.set(0, param.dseq)
  return data
}

function makeComputeListData(param: ComputeListParam): Map<number, any> {
    const data = new Map()
    if (param.owner) {
        data.set(0, param.owner)
    }
    return data
}

function getComputeInfo(message: Message): ComputeInfo {
  const data = message.getPayload()
  const result: ComputeInfo = {
    hash: Buffer.from(data.get(0)).toString("hex"),
  }
  return result
}

export function getDeploymentList(message: Message): DeploymentList {
  const data = message.getPayload()
  const result: DeploymentList = {
    deployments: data.get(0).map((item: any) => ({
        status: item.get(0),
        dseq: item.get(1),
        image: item.get(3),
        ...(item.get(2) && { meta: {
            provider: item.get(2).get(0),
            price: item.get(2).get(2),
            provider_info: {
                ...(item.get(2).get(1).get(0) && { host: item.get(2).get(1).get(0)}),
                port: item.get(2).get(1).get(1),
                external_port: item.get(2).get(1).get(2),
                protocol: item.get(2).get(1).get(3),
            }
          }})
  }))}
  return result
}
