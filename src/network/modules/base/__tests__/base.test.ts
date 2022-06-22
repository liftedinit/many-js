import cbor from "cbor"
import {
  identityStr2,
  makeMockResponseMessage,
  setupModule,
  taggedIdentity2,
} from "../../test/test-utils"
import { Base } from "../base"

describe("Base", () => {
  it("status() should return network status data", async () => {
    const mockCall = jest.fn(async () => {
      const publicKey = new Map()
        .set(1, 1)
        .set(3, -8)
        .set(4, [2])
        .set(-1, 6)
        .set(-2, new Uint8Array())
      const mockStatusResposneData = new Map()
        .set(0, 1)
        .set(1, "AbciModule(many-ledger)")
        .set(2, cbor.encode(publicKey))
        .set(3, taggedIdentity2)
        .set(4, [0, 1, 2, 3, 4, 6, 8, 9, 1002])
        .set(5, "0.1.0")
        .set(7, 300)
      return makeMockResponseMessage(mockStatusResposneData)
    })
    const base = setupModule(Base, mockCall)
    const res = await base.status()
    expect(mockCall).toHaveBeenCalledTimes(1)
    expect(mockCall).toHaveBeenCalledWith("status")
    expect(res).toEqual({
      status: {
        address: identityStr2,
        attributes: [0, 1, 2, 3, 4, 6, 8, 9, 1002],
        protocolVersion: 1,
        publicKey: new Map()
          .set(1, 1)
          .set(3, -8)
          .set(4, [2])
          .set(-1, 6)
          .set(-2, new Uint8Array()),
        serverName: "AbciModule(many-ledger)",
        serverVersion: "0.1.0",
        timeDelta: 300,
      },
    })
  })
  it("endpoints() should return a list of endpoints", async function () {
    const mockCall = jest.fn(async () => {
      const endpointsResponseContent = [
        "account.addFeatures",
        "account.addRoles",
        "account.create",
        "account.disable",
      ]
      return makeMockResponseMessage(endpointsResponseContent)
    })
    const base = setupModule(Base, mockCall)
    const res = await base.endpoints()
    expect(mockCall).toHaveBeenCalledTimes(1)
    expect(mockCall).toHaveBeenCalledWith("endpoints")
    expect(res).toEqual({
      endpoints: [
        "account.addFeatures",
        "account.addRoles",
        "account.create",
        "account.disable",
      ],
    })
  })
  it("heartbeat() should exist", async function () {
    const mockCall = jest.fn(async () => {
      return makeMockResponseMessage(null)
    })
    const base = setupModule(Base, mockCall)
    await base.heartbeat()
    expect(mockCall).toHaveBeenCalledTimes(1)
    expect(mockCall).toHaveBeenCalledWith("heartbeat")
  })
})
