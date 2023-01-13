import cbor from "cbor"
import { ONE_MINUTE, ONE_SECOND } from "../../../const"
import { AnonymousIdentity } from "../../../identity"
import { Message } from "../../../message"
import { CborMap } from "../../../message/cbor"
import { decoders } from "../../../message/cose"
import { throwOnErrorResponse } from "../../../utils"
import { Network } from "../../network"
import type { NetworkModule } from "../types"

const sleep = async (time: number) => new Promise(r => setTimeout(r, time))

interface Async extends NetworkModule {
  handleAsyncToken: (message: Message, n?: Network) => Promise<unknown>
}

export const Async: Async = {
  _namespace_: "async",

  async handleAsyncToken(message: Message, n?: Network) {
    const asyncToken = message.getAsyncToken()
    return asyncToken
      ? await pollAsyncStatus(
          n ?? new Network(this.url, new AnonymousIdentity()),
          asyncToken,
        )
      : message
  },
}

export enum AsyncStatusResult {
  Unknown = 0,
  Queued = 1,
  Processing = 2,
  Done = 3,
  Expired = 4,
}

type AsyncStatusPayload =
  | { result: AsyncStatusResult.Unknown }
  | { result: AsyncStatusResult.Queued }
  | { result: AsyncStatusResult.Processing }
  | { result: AsyncStatusResult.Expired }
  | {
      result: AsyncStatusResult.Done
      payload: ArrayBuffer
    }
function parseAsyncStatusPayload(cbor: CborMap): AsyncStatusPayload {
  const index = cbor.get(0)
  if (typeof index != "number") {
    throw new Error("Invalid async result")
  }
  if (!(index in AsyncStatusResult)) {
    throw Error("Invalid async result")
  }
  const result = index as AsyncStatusResult
  let payload = undefined
  if (result === AsyncStatusResult.Done) {
    payload = cbor.get(1) as ArrayBuffer
    if (!payload || !Buffer.isBuffer(payload)) {
      throw Error("Invalid async result")
    }
  }
  return { result, payload } as AsyncStatusPayload
}
async function pollAsyncStatus(
  n: Network,
  asyncToken: ArrayBuffer,
  options: {
    timeoutInMsec?: number
    waitTimeInMsec?: number
  } = {},
): Promise<Message> {
  const timeoutInMsec = options.timeoutInMsec ?? ONE_MINUTE
  let waitTimeInMsec = options.waitTimeInMsec ?? ONE_SECOND
  const end = +new Date() + timeoutInMsec
  while (true) {
    const res = (await n.call(
      "async.status",
      new Map([[0, asyncToken]]),
    )) as Message
    const result = parseAsyncStatusPayload(res.getPayload())
    switch (result.result) {
      case AsyncStatusResult.Done:
        let payload = cbor.decode(result.payload, decoders)
        if (Array.isArray(payload)) {
          payload = cbor.decode(payload?.[2], decoders)
        }
        return throwOnErrorResponse(new Message(payload?.value))
      case AsyncStatusResult.Expired:
        throw new Error("Async Expired before getting a result")
    }
    if (Date.now() >= end) {
      return res
    }
    await sleep(waitTimeInMsec)
    waitTimeInMsec *= 1.5
  }
}
